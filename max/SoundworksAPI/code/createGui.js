var stateName = jsarguments[1];

var schemaDict = new Dict(stateName + '_infos');
var schemaJson = schemaDict.stringify();
schema = JSON.parse(schemaJson);

var valuesDict = new Dict(stateName + '_values');
var valuesJson = valuesDict.stringify();
values = JSON.parse(valuesJson);

function bang() {
  createSliderInterface('volume', schema.volume, values.volume);
}

function createSliderInterface(name, def, initValues) {
  var patch = this.patcher;

  var receive = patch.newdefault(600, 240, 'r', 'update-' + stateName);
  var unpack = patch.newdefault(600, 270, 'dict.unpack', 'volume:');
  var dbToMidicale = patch.newdefault(600, 300, 'scale', -80, 6, 0, 127);
  var prependSet = patch.newdefault(600, 330, 'prepend', 'set');
  var slider = patch.newdefault(600, 360, 'slider');
  var midiToDbScale = patch.newdefault(600, 510, 'scale', 0, 127, -80, 6);
  var prependVolume = patch.newdefault(600, 540, 'prepend', 'volume', ':');
  var send = patch.newdefault(600, 570, 's', 'set-' + stateName);

  patcher.connect(receive, 0, unpack, 0);
  patcher.connect(unpack, 0, dbToMidicale, 0);
  patcher.connect(dbToMidicale, 0, prependSet, 0);
  patcher.connect(prependSet, 0, slider, 0);
  patcher.connect(slider, 0, midiToDbScale, 0);
  patcher.connect(midiToDbScale, 0, prependVolume, 0);
  patcher.connect(prependVolume, 0, send, 0);
}

