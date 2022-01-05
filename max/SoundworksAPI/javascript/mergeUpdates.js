function stringiNull(obj) {
  for (var key in obj) {
    if(obj[key] == null) {
      obj[key] = "null";
    }
  }
}



var dictName = jsarguments[1];
var dict = new Dict(dictName);

function update() {
  var args = arrayfromargs(arguments);
  // get updates
  var json = args.toString();
  var obj = JSON.parse(json);

  stringiNull(obj);

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

function getValues() {
  var args = arrayfromargs(arguments);
  var json = args.toString();
  var obj = JSON.parse(json);

  stringiNull(obj);

  dict.clear();


  dict.parse(JSON.stringify(obj));

  outlet(0, 'bang');


}


//Si la clé est dans le dictionnaire --> ne rien faire
// Si la clé n'est pas dans le dictionnaire, l'ajouter puis envoyer une attach request.
var idDict = new Dict('sw_id');

function attachResponse() {
  var arr = arrayfromargs(messagename, arguments);
  var stateId = arr[1];
  var remoteId = arr[2];
  var schemaName = arr[3];
  var schema = arr[4];
  var initValues = JSON.parse(arr[5].toString());

  stringiNull(initValues);


  
  if (!idDict.contains(schemaName + '::remoteID')) {
    idDict.replace(schemaName + '::stateID', stateId);
    idDict.replace(schemaName + '::remoteID', remoteId);

    var infosDict = new Dict(schemaName + '_infos');
    infosDict.parse(schema);

    var valueDict = new Dict(schemaName + '_values');
    //valueDict.parse(initValues);
    valueDict.parse(JSON.stringify(initValues));

    messnamed(schemaName+"_sw.sendID","bang");

    post("attached to "+schemaName+" - stateId: "+stateId+" - remoteId: "+remoteId);post();
  }
}



