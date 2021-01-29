autowatch = 1;
inlets = 1;
outlets = 1;

var d = new Dict("one");

function n(x){

	d.set("name",x);
var p =d.get("name"); 
post("@ set: " + p);
post();
outlet(0,p);

}

function loadbang(){

var p =d.get("name"); 
post("@ loadbang: " + p);
post();
outlet(0,p);
	
}	