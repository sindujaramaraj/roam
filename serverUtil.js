var https = require('https');

var ServerUtil = {
	getURLParams: function (params, defaultParams) {
		var paramsArr = defaultParams ? defaultParams.slice() : [];
		var value;
		for (key in params) {
			value = params[key];
			if (value == null || typeof value == "undefined") {
				continue;
			}
			paramsArr.push(key + "=" + value);
		}
		return "?" + paramsArr.join('&');
	},
	makeHttpGet: function (hostname, path, callback) {
		var options = {
				hostname: hostname,
				path: path,
				method: 'GET'
		};
		console.log("Query: " + options.path);
		var req = https.request(options, callback);
		req.end();
		req.on("error", function(e) {
			console.error("Error: " + e);
		});
	}
};

module.exports = ServerUtil; 