var dictName = jsarguments[1];
var dict = new Dict(dictName);

function update() {
  var args = arrayfromargs(arguments);
  // get updates
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

  outlet(0, 'bang');
}
