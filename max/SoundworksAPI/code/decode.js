function anything() {
	var json = arrayfromargs(messagename, arguments);
	var obj = JSON.parse(json[0]);

	for (var key in obj) {
		var value = obj[key];
		if (typeof value === 'object') {
			value = JSON.stringify(value);
		}
		outlet(0, key, value);
	}
}