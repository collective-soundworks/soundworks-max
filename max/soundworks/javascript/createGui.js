var stateName = jsarguments[1];

var x = 500;
var y = 300;

var schema = null;
var values = null;

function anything() {
  // lazy get dicts so as to make sure the they are ready on patch load
  if (schema === null && values === null) {
    var schemaDict = new Dict(stateName + '_infos');
    var schemaJson = schemaDict.stringify();
    schema = JSON.parse(schemaJson);

    var valuesDict = new Dict(stateName + '_values');
    var valuesJson = valuesDict.stringify();
    values = JSON.parse(valuesJson);
  }

  if (messagename in schema) {
    var name = messagename;
    var def = schema[name]
    var initValue = values[name];
    var type = def.type;

    switch(type) {
      case 'float':
        createFloatInterface(name, def, initValue);
        x += 180;
        break;
      case 'integer':
        createIntInterface(name, def, initValue);
        x += 180;
        break;
      case 'boolean':
        createToggleInterface(name, def, initValue);
        x += 180;
        break;
      case 'string':
        createStringInterface(name, def, initValue);
        x += 180;
        break;
      default:
        post('Cannot create interface for "' + name + '", interface for type "' + type + '" does is not implemented', '\n');
        break;
    }
  } else {
    post('Unknown param "' + messagename + '" for state "' + stateName + '"', '\n');
  }
}

function createIntInterface(name, def, initValue) {
  var patch = this.patcher;

  var comment = patch.newdefault(x, y, 'comment');
  comment.set(name);

  var receive = patch.newdefault(x, y + 30, 'r', 'update-' + stateName);
  var unpack = patch.newdefault(x, y + 60, 'dict.unpack', name+":");
  var prependSet = patch.newdefault(x, y + 90, 'prepend', 'set');

  var args = [x, y + 120, 'number'];

  if (def.min !== null) {
    args.push('@minimum');
    args.push(def.min);
  }
  if (def.max !== null) {
    args.push('@maximum');
    args.push(def.max);
  }

  var int = patch.newdefault.apply(patch, args);
  int.set(initValue);

  var prependVolume = patch.newdefault(x, y + 150, 'prepend', name, ':');
  var send = patch.newdefault(x, y + 180, 's', 'set-' + stateName);

  patcher.connect(receive, 0, unpack, 0);
  patcher.connect(unpack, 0, prependSet, 0);
  patcher.connect(prependSet, 0, int, 0);
  patcher.connect(int, 0, prependVolume, 0);
  patcher.connect(prependVolume, 0, send, 0);
}

function createFloatInterface(name, def, initValue) {
  var patch = this.patcher;

  var comment = patch.newdefault(x, y, 'comment');
  comment.set(name);

  var receive = patch.newdefault(x, y + 30, 'r', 'update-' + stateName);
  var unpack = patch.newdefault(x, y + 60, 'dict.unpack', name+':');
  var prependSet = patch.newdefault(x, y + 90, 'prepend', 'set');

  var args = [x, y + 120, 'flonum'];

  if (def.min !== -Infinity) {
    args.push('@minimum');
    args.push(def.min);
  }
  if (def.max !== +Infinity) {
    args.push('@maximum');
    args.push(def.max);
  }

  var float = patch.newdefault.apply(patch, args);
  float.set(initValue);

  var prependVolume = patch.newdefault(x, y + 150, 'prepend', name, ':');
  var send = patch.newdefault(x, y + 180, 's', 'set-' + stateName);

  patcher.connect(receive, 0, unpack, 0);
  patcher.connect(unpack, 0, prependSet, 0);
  patcher.connect(prependSet, 0, float, 0);
  patcher.connect(float, 0, prependVolume, 0);
  patcher.connect(prependVolume, 0, send, 0);
}

function createToggleInterface(name, def, initValue) {
  var patch = this.patcher;

  var comment = patch.newdefault(x, y, 'comment');
  comment.set(name);

  var receive = patch.newdefault(x, y + 30, 'r', 'update-' + stateName);
  var unpack = patch.newdefault(x, y + 60, 'dict.unpack', name+':');
  var prependSet = patch.newdefault(x, y + 90, 'prepend', 'set');

  var toggle = patch.newdefault(x, y + 120, 'toggle');
  toggle.set(initValue);

  var prependVolume = patch.newdefault(x, y + 150, 'prepend', name, ':');
  var send = patch.newdefault(x, y + 180, 's', 'set-' + stateName);

  patcher.connect(receive, 0, unpack, 0);
  patcher.connect(unpack, 0, prependSet, 0);
  patcher.connect(prependSet, 0, toggle, 0);
  patcher.connect(toggle, 0, prependVolume, 0);
  patcher.connect(prependVolume, 0, send, 0);
}

function createStringInterface(name, def, initValue) {
  var patch = this.patcher;

  var comment = patch.newdefault(x, y, 'comment');
  comment.set(name);

  var receive = patch.newdefault(x, y + 30, 'r', 'update-' + stateName);
  var unpack = patch.newdefault(x, y + 60, 'dict.unpack', name+':');
  var prependSet = patch.newdefault(x, y + 90, 'prepend', 'set');

  var msg = patch.newobject('message', x, y + 120, 110, 12);
  msg.set(initValue);

  var prependVolume = patch.newdefault(x, y + 150, 'prepend', name, ':');
  var send = patch.newdefault(x, y + 180, 's', 'set-' + stateName);

  patcher.connect(receive, 0, unpack, 0);
  patcher.connect(unpack, 0, prependSet, 0);
  patcher.connect(prependSet, 0, msg, 0);
  patcher.connect(msg, 0, prependVolume, 0);
  patcher.connect(prependVolume, 0, send, 0);
}

// function createSliderInterface(name, def, initValues) {
//   var patch = this.patcher;

//   var receive = patch.newdefault(600, 240, 'r', 'update-' + stateName);
//   var unpack = patch.newdefault(600, 270, 'dict.unpack', 'volume:');
//   var dbToMidicale = patch.newdefault(600, 300, 'scale', -80, 6, 0, 127);
//   var prependSet = patch.newdefault(600, 330, 'prepend', 'set');
//   var slider = patch.newdefault(600, 360, 'slider');
//   var midiToDbScale = patch.newdefault(600, 510, 'scale', 0, 127, -80, 6);
//   var prependVolume = patch.newdefault(600, 540, 'prepend', 'volume', ':');
//   var send = patch.newdefault(600, 570, 's', 'set-' + stateName);

//   patcher.connect(receive, 0, unpack, 0);
//   patcher.connect(unpack, 0, dbToMidicale, 0);
//   patcher.connect(dbToMidicale, 0, prependSet, 0);
//   patcher.connect(prependSet, 0, slider, 0);
//   patcher.connect(slider, 0, midiToDbScale, 0);
//   patcher.connect(midiToDbScale, 0, prependVolume, 0);
//   patcher.connect(prependVolume, 0, send, 0);
// }
