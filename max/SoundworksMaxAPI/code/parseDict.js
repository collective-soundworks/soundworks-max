
inlets = 1;
outlets = 1;


function parseDict(dictName)
{
	// argument is the name of a dict, which may or may not already exist. 
	// in this case there is already a dict named "northern animals" and we will reference that dict.
	var d = new Dict("infos");
	
	// an optional 'true' arg to getnames() will get all dictionary names
	// rather than just explicitly named dictionaries
	
	// getkeys() will return an array of strings, each string being a key for our dict
	var keys = d.getkeys();
	
	// access the name of a dict object as a property of the dict object
	
	// the quiet property functions the same as the @quiet attribute to dict in Max
	// it suppresses many errors or warnings if set to true
	d.quiet = false;

	// changing the name property of a dict object does _not_ rename a dict.
	// changing the name property of a dict object tells it to reference different dictionary --
 	// one that is associated with the different name.


	//post_info(d.name, d.getkeys());

	
	// the contains() method can be used to see if a key exists in a dict
	// this is checking for a key that is nested in a sub-dictionary of a sub-dictionary
	for (var pas = 0; pas < keys.length; pas++) {
		var type = d.get(keys[pas]+"::type");
		//post("type = ",type);
		//post();
		switch (type) {
			case "integer":
				var min = d.get(keys[pas]+"::min");
				var max = d.get(keys[pas]+"::max");
				//outlet(0,keys[pas],"integer", min,max);
				maker(keys[pas],"integer", min, max);
				break;
			case "boolean":
				//outlet(0, keys[pas], "boolean",0,0);
				maker(keys[pas], "boolean",0,0);
				break;
			case "float":
				var min = d.get(keys[pas]+"::min");
				var max = d.get(keys[pas]+"::max");
				if (keys[pas] == "float") {
					post("unallowed variable name : float");post();
				}
				else {
					//outlet(0,keys[pas], "float", min,max);
					maker(keys[pas], "float", min, max);
				}
				break;
			case "string":
				//outlet(0,keys[pas], "string",0,0);
				maker(keys[pas], "string", 0, 0);	
				break;
			case "any":
				//outlet(0,keys[pas], "any",0,0);
				maker(keys[pas], "any",0,0);
				break;
			default:
				post("unknown type");
				post();
		}
	}


}

function maker(varName, varType, varMin, varMax)
{
	var parent = p.parentpatcher;
	object = parent.newdefault(500,90,"bpatcher",varType+".sw.bp", "@args","globals", varName, varMin, varMax);
}


function create()
{
	//post(arguments[0]);
	parseDict();
	

}
