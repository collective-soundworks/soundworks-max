//Si la clé est dans le dictionnaire sw_keys --> ne rien faire
// Si la clé n'est pas dans le dictionnaire sw_keys, l'ajouter puis envoyer une attach request.
var keyDict = new Dict('sw_keys');
var idDict = new Dict('sw_id');

function anything() {
	var arr = arrayfromargs(messagename, arguments);
	var schemaName = arr[0];
	//var stateId = "null";
	//var nodeId = "null";
	var uniqKey = schemaName+jsarguments[1].toString();
	//post(uniqKey);
	
	if (!keyDict.contains(uniqKey)) {
		keyDict.replace(uniqKey);
		//post("voici uniqKey "+uniqKey);
		//post("j'ai ajouté "+uniqKey+" dans sw_keys")
		idDict.replace(schemaName + '::stateID', "");
		idDict.replace(schemaName + '::nodeID', "");
		
		outlet(0,arr);
	}
}