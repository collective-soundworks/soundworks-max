//Si la clé est dans le dictionnaire --> ne rien faire
// Si la clé n'est pas dans le dictionnaire, l'ajouter puis envoyer une attach request.
var keyDict = new Dict('sw_keys');
var idDict = new Dict('sw_id');

function anything() {
	var arr = arrayfromargs(messagename, arguments);
	var schemaName = arr[0];
	var stateId = arr[1];
	var nodeId = arr[2];
	var uniqKey = arr.join('_');
	
	if (!keyDict.contains(uniqKey)) {
		keyDict.replace(uniqKey);
		idDict.replace(schemaName + '::stateID', stateId);
		idDict.replace(schemaName + '::nodeID', nodeId);
		
		outlet(0,arr);
	}
}