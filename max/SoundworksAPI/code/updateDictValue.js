//var d = new Dict(jsarguments[1]);
var d = new Dict("toto");

function test() {
	var arr = arrayfromargs(arguments);
	var json = arr.join("");
	var data = JSON.parse(json);

	for (var name in data) {
		//d.setparse(name,JSON.stringify(data[name]));
		//d.setparse("triggers",'{ "x" : 0.9,"y":0.3}');
		d.setparse("meatloaf", '{ "price" : "priceless", "lyric" : "I would do anything for love but I won\'t eat that" }');
	
		//post(name,JSON.stringify(data[name]),'\n');
	}

	outlet(0, 'bang');
	
}