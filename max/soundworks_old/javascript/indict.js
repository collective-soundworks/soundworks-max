//Si la clé est dans le dictionnaire sw_keys --> ne rien faire
// Si la clé n'est pas dans le dictionnaire sw_keys, l'ajouter puis envoyer une attach request.
// L'instance qui s'occupe d'associer doit être celle du schema en question. ex:globals ne peut pas associer trigger-controller.
var keyDict = new Dict('sw_keys');
var idDict = new Dict('sw_id');

function anything() {
	var arr = arrayfromargs(messagename, arguments);
	var schemaName = arr[0];
	var stateId = arr[1];
	var nodeId = arr[2];
	var uuid = jsarguments[1];
	var thisSchemaName = jsarguments[2];
	//post("j'ai reçu cette observe!!!!! "+arr)
	if (!keyDict.contains(schemaName) && schemaName === thisSchemaName) {
		//keyDict.replace(schemaName+);
		keyDict.replace(schemaName,uuid)
		//post("voici uniqKey "+uniqKey);
		//post("j'ai ajouté "+uniqKey+" dans sw_keys")
		idDict.replace(schemaName + '::stateID', stateId);
		idDict.replace(schemaName + '::nodeID', nodeId);
		
		outlet(0,arr);

		//send attach request
		//messnamed(uuid+"_udpsend","/sw/state-manager/attach-request "+arr.join(" "));
	}
}