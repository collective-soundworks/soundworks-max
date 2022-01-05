/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}

function isPlainObject(o) {
  var ctor,prot;

  if (isObject(o) === false) return false;

  // If has modified constructor
  ctor = o.constructor;
  if (ctor === undefined) return true;

  // If has modified prototype
  prot = ctor.prototype;
  if (isObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
};


function stringifyNull(obj) {
  for (var key in obj) {
    if (isPlainObject(obj[key])) {
      stringifyNull(obj[key])
    } else if (obj[key] === null) {
      obj[key] = "null";
    }
  }
  
  return obj
}


var dictName = jsarguments[1];
var dict = new Dict(dictName);

function update() {
  var args = arrayfromargs(arguments);
  // get updates
  var json = args.toString();
  var obj = JSON.parse(json);

  stringifyNull(obj);

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

  stringifyNull(obj);

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
  var schema = JSON.parse(arr[4].toString());
  var initValues = JSON.parse(arr[5].toString());

  stringifyNull(initValues);
  stringifyNull(schema);

  
  if (!idDict.contains(schemaName + '::remoteID')) {
    idDict.replace(schemaName + '::stateID', stateId);
    idDict.replace(schemaName + '::remoteID', remoteId);

    var infosDict = new Dict(schemaName + '_infos');
    //infosDict.parse(schema);
    infosDict.parse(JSON.stringify(schema));

    var valueDict = new Dict(schemaName + '_values');
    //valueDict.parse(initValues);
    valueDict.parse(JSON.stringify(initValues));

    messnamed(schemaName+"_sw.sendID","bang");

    post("attached to "+schemaName+" - stateId: "+stateId+" - remoteId: "+remoteId);post();
  }
}



