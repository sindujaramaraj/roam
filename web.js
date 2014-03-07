var express = require("express"),
	app = express(),
	http = require('http'),
	fs = require('fs'),
	mongoose = require('mongoose');

//database connection
mongoose.connect('mongodb://root:root@ds027709.mongolab.com:27709/heroku_app17202537');

//some environment variables
app.set('port', process.env.PORT || 5000);
app.set('views', __dirname + '/static');
app.engine('html', require('ejs').renderFile);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(__dirname + '/static'));

//dynamically include routes (Controller)
/*fs.readdirSync('./controller').forEach(function (file) {
  if(file.substr(-3) == '.js') {
      route = require('./controller/' + file);
      route.controller(app);
  }
});
*/
//create server
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

app.on('error', function(err) {});

/* App */
var fsApiConnector = require('./fsApiConnector.js');
var googleApiConnector = require('./googleApiConnector.js');
var freebaseApiConnector = require('./freebaseApiConnector.js');

/* Server init */
app.get('/', function(req, res) {
  res.render('index.html');
});

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
	freebaseApiConnector.getPlacesForCountry(req.query.country, getCallback(res));
});

app.get('/getPlacesForLocality', function(req, res) {
	freebaseApiConnector.getPlacesForLocality(req.query.locality, getCallback(res));
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