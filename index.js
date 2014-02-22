// helpful for debugging
var pinturaApp, settings = require("perstore/util/settings"), Static = require("pintura/jsgi/static").Static, start = require("pintura/start-node").start;

function setPinturaApp() {
	pinturaApp = require("pintura/pintura").app;
	require("./app");
}

require.reloadable ? require.reloadable(setPinturaApp) : setPinturaApp();
start(
// uncomment this to enable compression with node-compress
// require("pintura/jsgi/compress").Compress(
// make the root url redirect to /Page/Root
require("./jsgi/redirect-root").RedirectRoot(
		require("pintura/jsgi/cascade").Cascade([
		// cascade from static to pintura REST handling
		// the main place for static files accessible from the web
		Static({
			urls : [ "/static" ],
			root : "static",
			directoryListing : true
		}), Static({
			urls : [ "/packages" ],
			root : require('pintura/util/packages-dir'),
			directoryListing : true
		}),
		// uncomment this for an optional explorer (needs the persvr package)
		// Static({urls:["/explorer"], root:
		// require.resolve("persevere/persvr").replace(/persvr.js$/,'') +
		// "/explorer"}),
		// this will provide access to the server side JS libraries from the
		// client
		pinturaApp ]))
// )
);

if (require.main == module && settings.repl) {
	require("repl").start('persevere>');
}
// this is just to ensure the static analysis preloads the explorer package
false && require("persevere-client/explorer/explorer.js");

/* App */
var express = require("express");
var app = express();
app.use(express.logger());

var fsApiConnector = require('./fsApiConnector.js');
var googleApiConnector = require('./googleApiConnector.js');
var freebaseApiConnector = require('./freebaseApiConnector.js');

debugger;
app.get('/getVenues', function(req, res) {
	fsApiConnector.getVenues({
		near : req.query.near,
		query : req.query.query,
		offset : req.query.offset,
		limit : req.query.limit,
		section : req.query.section
	}, getCallback(res));
});

app.get('/getCategories', function(req, res) {
	fsApiConnector.getCategories({}, getCallback(res));
});

app.get('/getPlaceDetails', function(req, res) {
	googleApiConnector.getPlaceDetails(req.query.reference, getCallback(res));
});

app.get('/getPlacesForCountry', function(req, res) {
	freebaseApiConnector.getPlacesForCountry(req.query.country, res);
});

app.get('/getDescription', function(req, res) {
	freebaseApiConnector.getDescription(req.query.id, getCallback(res));
});

function getCallback(pRes) {
	return function(res) {
		var response = "";
		res.on('data', function(d) {
			response += d;
		});
		res.on('end', function() {
			pRes.send(response);
		});
	};
}