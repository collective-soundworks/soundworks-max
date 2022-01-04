//Si la clé est dans le dictionnaire --> ne rien faire
// Si la clé n'est pas dans le dictionnaire, l'ajouter puis envoyer une attach request.
var idDict = new Dict('sw_id');

function anything() {
	var arr = arrayfromargs(messagename, arguments);
	var stateId = arr[0];
	var remoteId = arr[1];
	var schemaName = arr[2];
	var schema = arr[3];
	var initValues = arr[4];
	
	if (!idDict.contains(schemaName + '::remoteID')) {
		idDict.replace(schemaName + '::stateID', stateId);
		idDict.replace(schemaName + '::remoteID', remoteId);

		var infosDict = new Dict(schemaName + '_infos');
		infosDict.parse(schema);

		var valueDict = new Dict(schemaName + '_values');
		valueDict.parse(initValues);

		messnamed(schemaName+"_sw.sendID","bang");

		post("attached to "+schemaName+" - stateId: "+stateId+" - remoteId: "+remoteId);post();
	}
}