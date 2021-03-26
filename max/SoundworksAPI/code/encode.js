
function anything() {
	var args = arrayfromargs(messagename, arguments);
	const obj = {};
	obj[args[0]] = args[1];

	const json = JSON.stringify(obj);
	outlet(0, json);
}