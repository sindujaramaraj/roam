var pg = require('pg');
 
var DBConnector = {
	getItinery: function() {
		pg.connect(process.env.DATABASE_URL, function(err, client, done) {
			client.query('SELECT * FROM itinery', function(err, result) {
				done();
				if (err) {
					return console.error(err);
				}
				console.log(result.rows);
			});
		});
	},
	checkTableExists: function(table) {
		
	}
};
