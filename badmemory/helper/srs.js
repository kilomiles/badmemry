var express = require('express');
var app = express();

//Database related:
var Sequelize = require('sequelize');
var db_connection = require('../../badmemory/lib/secret_db').heroku;
var sequelize_options = { dialect: 'postgres', native: true };
console.log ("Opening connection to " + db_connection);
var sequelize = new Sequelize(db_connection, sequelize_options);
var models = require('../../badmemory/models').setup(sequelize);
sequelize.sync({force: false});
sequelize.authenticate().complete(function(err) { throw err; });

app.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();
});

app.get('/data', function(req, res) {
	var username = decodeURIComponent(req.url).substring(req.url.indexOf("&username=")+10, req.url.indexOf("&p="));
	console.log("srs.js: " + username + " is requesting their sentences.");

	var resp = [];
	//Get all sentences for user that have never been reviewed or are due to be reviewed.
	sequelize.query('SELECT * FROM sentences WHERE "userId"=? AND ("nextStudied" IS ? OR "nextStudied" <= LOCALTIMESTAMP)', null, {raw:true}, [username, null]).success(function(results) {
		
		for (var s=0; s < results.length; s++) {
			resp.push(results[s]);
		}
		res.send(resp);
	});
});

app.listen('8082');
console.log('srs.js is running on port 8082');
exports = module.exports = app;
