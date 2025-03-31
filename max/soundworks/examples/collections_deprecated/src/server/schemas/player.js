export default {
  volume: {
    type: 'float',
    min: 0,
    max: 1,
    default: 0,
  },
  frequency: {
    type: 'float',
    min: 1,
    max: 20000,
    default: 400,
  },
  oscillatorType: {
    type: "string",
  default: "sine"
  }
};
