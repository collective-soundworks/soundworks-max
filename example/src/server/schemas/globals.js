export default {
  volume: {
    type: 'integer',
    min: -80,
    max: 6,
    default: 0,
  },
  mute: {
    type: 'boolean',
    default: false,
  },
  gain: {
    type: 'float',
    min: 0,
    max: 1,
    step: 0.001,
    default: 0.5,
  },
  message: {
    type: 'string',
    default: 'my-message',
  },
  config: {
    type: 'any',
    default: { a: 1, b: true },
  },
  // new options
  event: {
    type: 'boolean',
    default: true,
    event: true,
  },
  noFilterChange: {
    type: 'boolean',
    default: true,
    filterChange: false,
  },
  immediate: {
    type: 'integer',
    default: 0,
    immediate: true,
  },
  //
  loadBigData: {
    type: 'boolean',
    default: true,
    event: true,
  },
  bigData: {
    type: 'any',
    default: null,
    nullable: true,
    filterChange: false,
  },
}
