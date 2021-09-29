var dictName = jsarguments[1];
var dict = new Dict(dictName);

function update() {
  var args = arrayfromargs(arguments);
  var json = args.toString();
  var obj = JSON.parse(json);

  // get current dict state
  var dictJson = dict.stringify();
  var dictObj = JSON.parse(dictJson);

  // merge current values with updates
  // Object.assign(dictObj, obj); // aie...
  for (var name in obj) {
    dictObj[name] = obj[name]
  }

  dict.parse(JSON.stringify(dictObj));

  // for (var name in obj) {
  //   if (typeof obj[name] !== 'object') {
  //     dict.set(name, obj[name]);
  //   } else {
  //     var test = new Dict('test');
  //     // post(JSON.stringify(obj[name]), '\n');
  //     test.parse(JSON.stringify(obj[name]));
  //     dict.set(name, test);
  //   }
  // }

  // [{"x":0.4541984732824428,"y":0.5620229007633588}]

  outlet(0, 'bang');
}
