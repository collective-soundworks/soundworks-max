// src/server/schemas/globals.js
export default {
  // volume volume in dB [-60, 6]
  volume: {
    type: 'float',
    min: -60,
    max: 6,
    default: 0,
  },
  // mute [true, false]
  mute: {
    type: 'boolean',
    default: false,
  },
};
