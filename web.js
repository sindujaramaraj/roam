var express = require("express");
var app = express();
app.use(express.logger());

/* Server init */
app.get('/', function(request, response) {
  response.send('hello');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});

app.use(express.static(__dirname + '/static'));

/* App */
var fsApiConnector = require("./fsApiConnector.js");

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