//Si la clé est dans le dictionnaire --> ne rien faire
// Si la clé n'est pas dans le dictionnaire, l'ajouter puis envoyer une attach request.


d = new Dict(jsarguments[1]);

function anything()
{
	var a = arrayfromargs(messagename, arguments);

	var isPresent = d.contains(a);


	if (isPresent) {
		//post("yes");post()
	}
	else {
		d.replace(a+"::stateID",-1);
		d.replace(a+"::remoteID",-1);
		outlet(0,a);
		//post("no");post();
	}


}