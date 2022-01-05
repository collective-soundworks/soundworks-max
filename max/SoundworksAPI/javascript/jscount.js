var schemaName = jsarguments[1];
var uuid = jsarguments[2];

var g = new Global(schemaName);
var idDict = new Dict('sw_id');
var keyDict = new Dict('sw_keys');
var thisValueDict = new Dict(schemaName+'_values');
var thisInfosDict = new Dict(schemaName+'_infos');


idDict.quiet = true;
keyDict.quiet = true;

// increments g.count only if g.count is defined. If not, it means this is the first JS instance and g.count is init to 1;
function add(){
	if(g.count){
		g.count++;
	}
	else { 
		g.count = 1;
		attach();
	}
	send();
}

// decrements g.count
function remove(){
	g.count--;
	if (g.count == 0){
		detach()
	}
	send();
}

// send g.count to nb_of_instances receive
function send(){
	//messnamed('nb_of_instances', schemaName, g.count);
	//post("nb_of_instances",schemaName,g.count);post();
} 

// when JS instance is removed, decrements g.count
function notifydeleted(){
	remove();
}

// at start, increments g.count
add();

// bang: reset g.count and wait to re-count all instances
function bang(){
	g.count = null;
	var waitReset = new Task(function(){
		add();
	});
	waitReset.schedule(200);
}

function attach(){
	post("Observe request to "+schemaName);post();
	var wait = new Task(function(){
		messnamed(uuid+".sw.observe","bang");
	});
	wait.schedule(50);
}

function detach(){

	post("Detach request to "+schemaName);post();
	var stateId = idDict.get(schemaName + '::stateID');
	var nodeId = idDict.get(schemaName + '::nodeID');
	var key = schemaName+uuid.toString();
	//post("voici key "+key);
	keyDict.remove(key);
	idDict.remove(schemaName);
	thisInfosDict.clear();
	thisValueDict.clear();

	messnamed(uuid+".sw.detach","bang");

}





