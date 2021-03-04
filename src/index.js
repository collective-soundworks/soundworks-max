import { Client as OscClient, Server as OscServer } from 'node-osc';
import chalk from 'chalk';

function coerseValue(key, value, def) {
  if (!def) {
    throw new Error(`Param "${key}" does not exists`);
  }

  switch (def.type) {
    case 'float': {
      const coersed = parseFloat(value);

      if (!Number.isNaN(coersed)) {
        return coersed;
      } else {
        if (def.nullable === true) {
          return null;
        } else {
          throw new Error(`Invalid value "${value}" for param "${key}"`);
        }
      }
      break;
    }
    case 'integer': {
      const coersed = parseInt(value);

      if (!Number.isNaN(coersed)) {
        return coersed;
      } else {
        if (def.nullable === true) {
          return null;
        } else {
          throw new Error(`Invalid value "${value}" for param "${key}"`);
        }
      }
      break;
    }
    case 'boolean': {
      return !!value;
      break;
    }
    case 'string': {
      return value + '';
      break;
    }
    case 'enum': {
      const list = def.list;

      if (list.indexOf(value) !== -1) {
        return list;
      } else {
        if (def.nullable === true) {
          return null;
        } else {
          throw new Error(`Invalid value "${value}" for param "${key}"`);
        }
      }
      break;
    }
    case 'any': {
      return value;
      break;
    }
    default: {
      return value;
      break;
    }
  }
}

export class StateManagerOsc {
  constructor(stateManager, config = {}) {
    this.stateManager = stateManager;
    this.config = Object.assign({
      localAddress: '0.0.0.0',
      localPort: 57121,
      remoteAddress: '127.0.0.1',
      remotePort: 57122,
    }, config);

    // we keep a record of attached states, to send a notification to max
    // when the server exists
    this._attachedStates = new Map();
    this._listeners = new Map();

    this._observeListeners = new Map();
  }


  async init() {
    return new Promise((resolve, reject) => {
      this._oscClient = new OscClient(this.config.remoteAddress, this.config.remotePort);

      this._oscServer = new OscServer(this.config.localPort, this.config.localAddress, () => {
        // allow Max to resend its observe requests when node wakes up
        console.log(chalk.cyan('[@soundworks/state-manager-osc]'), 'listening:', this.config);
        this._oscClient.send('/sw/state-manager/listening');
        resolve();
      });

      // listen for incomming messages and dispatch
      this._oscServer.on('message', msg => {
        const [channel, ...args] = msg;
        this._emit(channel, args);
      });

      // send detach messages to max when the server shuts down
      const cleanup = async () => {
        console.log(chalk.cyan('[@soundworks/state-manager-osc]'), 'cleanup...');
        for (let [schemaName, infos] of this._attachedStates) {
          try {
            await infos.cleanStateFunc();
          } catch (err) {
            console.log(err);
          }
        };

        setTimeout(() => {
          console.log(chalk.cyan('[@soundworks/state-manager-osc]'), 'exiting...');
          process.exit();
        }, 0);
      };

      process.once('SIGINT', cleanup);
      process.once('beforeExit', cleanup);

      // @note: this is probably not very clean, to be reviewed
      this._subscribe('/sw/state-manager/observe-request', schemaName => {
        this.stateManager.observe((_schemaName, stateId, nodeId) => {
          // Max can only attach to states created by the server
          if (nodeId === -1) {
            if (_schemaName === schemaName) {
              this._oscClient.send('/sw/state-manager/observe-notification', schemaName /*, stateId */);
            }
          }
        });
      });

      // subscribe for `attach-request`s
      this._subscribe('/sw/state-manager/attach-request', async (schemaName, stateId) => {
        // we don't allow Max to attach mode than once to a state
        if (this._attachedStates.has(schemaName)) {
          const infos = this._attachedStates.get(schemaName);
          await infos.cleanStateFunc();
        }

        let state;

        try {
          // @note - use soundworks behavior to find the first state of its kind
          state = await this.stateManager.attach(schemaName/*, stateId */);
        } catch(err) {
          this._oscClient.send('/sw/state-manager/attach-error', err);
          return;
        }

        const { id, remoteId } = state;
        const schema = state.getSchema();

        const updateChannel = `/sw/state-manager/update-request/${id}/${remoteId}`;
        const unsubscribeUpdateRequests = this._subscribe(updateChannel, async updates => {
          updates = JSON.parse(updates);

          for (let key in updates) {
            try {
              updates[key] = coerseValue(key, updates[key], schema[key]);
            } catch(err) {
              console.log(chalk.cyan('[@soundworks/state-manager-osc]'), 'Ignoring param update:', err.message);
              delete updates[key];
            }
          }

          await state.set(updates);
        });

        const getValuesChannelRequest = `/sw/state-manager/get-values-request/${id}/${remoteId}`;
        const getValuesChannelResponse = `/sw/state-manager/get-values-response/${id}/${remoteId}`;
        const unsubscribeGetValues = this._subscribe(getValuesChannelRequest, async () => {
          const values = JSON.stringify(state.getValues());
          this._oscClient.send(getValuesChannelResponse, values);
        });

        const unsubscribeUpdateNotifications = state.subscribe(updates => {
          const channel = `/sw/state-manager/update-notification/${id}/${remoteId}`;

          updates = JSON.stringify(updates);
          this._oscClient.send(channel, updates);
        });

        const cleanStateFunc = async (detach = true) => {
          unsubscribeUpdateRequests();
          unsubscribeGetValues();
          unsubscribeUpdateNotifications();
          unsubscribeDetach();

          const channel = `/sw/state-manager/detach-notification/${id}/${remoteId}`;
          this._oscClient.send(channel);
          // notify max
          this._attachedStates.delete(schemaName);

          if (detach) {
            await state.detach();
          }
        }

        const detachChannel = `/sw/state-manager/detach-request/${id}/${remoteId}`;
        const unsubscribeDetach = this._subscribe(detachChannel, cleanStateFunc);

        state.onDetach(() => cleanStateFunc(false));

        const schemaStr = JSON.stringify(schema);
        const currentValues = JSON.stringify(state.getValues());

        this._attachedStates.set(schemaName, { state, cleanStateFunc });

        this._oscClient.send('/sw/state-manager/attach-response', id, remoteId, schemaName, schemaStr, currentValues);
      });
    });
  }

  _subscribe(channel, callback) {
    if (!this._listeners.has(channel)) {
      this._listeners.set(channel, new Set());
    }

    const listeners = this._listeners.get(channel);
    listeners.add(callback);

    return () => listeners.delete(callback);
  }

  _emit(channel, args) {
    if (this._listeners.has(channel)) {
      const listeners = this._listeners.get(channel);
      listeners.forEach(callback => callback(...args));
    }
  }
}
