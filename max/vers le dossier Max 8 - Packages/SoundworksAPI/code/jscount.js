var arg = jsarguments[1];
if (arg == null){
	arg = 'pouet';
}

var g = new Global(arg);

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
	//messnamed('nb_of_instances', arg, g.count);
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
	post("Demande d'observation effectuée à "+arg);post();
	var wait = new Task(function(){
		messnamed("sw.observe",arg);
	});
	wait.schedule(50);
}

function detach(){
	post("Demande de détachement effectuée à "+arg);post();
	messnamed(arg+".sw.detach","bang");
}





