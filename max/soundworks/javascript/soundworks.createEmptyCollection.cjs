const path = require('path');
const Max = require('max-api');

// This will be printed directly to the Max console
// Max.post(`Loaded the ${path.basename(__filename)} script`);

// Use the 'addHandler' function to register a function for a particular message

// let arr;
const instances = 40;
const arr = [];
for (let i = 0; i < instances; i++) {
  arr.push({ frequency:0, volume:0 });
}
const played = [];
const numPlayerAtSameTime = 20;
for (let i = 0; i < numPlayerAtSameTime; i++) {
  played.push(0);
}


Max.addHandler("list", (i, freq, volume) => {

  const toplay = played[i];

  arr[toplay].frequency = freq;
  arr[toplay].volume = volume;

  Max.outlet({"array": arr});

})

Max.addHandler("mute", () => {
for (let i = 0; i < instances; i++) {
  arr[i] = { frequency:0, volume:0 };
}
  Max.outlet({"array":arr});
})

Max.addHandler("bang", () => {

  for (let i = 0; i < numPlayerAtSameTime; i++) {
    const pi = Math.round(Math.random() * 39);
    played[i] = pi;
  };

  for (let i = 0; i < instances; i++) {
    arr[i] = { frequency:0, volume:0 };
  };

})
