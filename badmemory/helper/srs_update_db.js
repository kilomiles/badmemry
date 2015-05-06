var express = require('express');

var forceSSL = require("express-force-ssl");
var https = require('https');
var fs = require('fs');
var options = {
    key: fs.readFileSync('lib/key.pem'),
    cert: fs.readFileSync('lib/cert.pem'),
};

var app = express();
app.use(forceSSL);
app.set('httpsPort', 8089);

//Database related:
var Sequelize = require('sequelize');
var db_connection = require('../../badmemory/lib/secret_db').heroku;
var sequelize_options = { dialect: 'postgres', native: true };
console.log ("Opening connection to " + db_connection);
var sequelize = new Sequelize(db_connection, sequelize_options);
var models = require('../../badmemory/models').setup(sequelize);
sequelize.sync({force: false});
sequelize.authenticate().complete(function(err) { throw err; });

//Prevent cross-origin errors
app.all('*', function(req, res, next) {
    	res.header('Access-Control-Allow-Origin', '*');
    	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
	next();
});

//Receieve and handle GET request 
app.get('/', function(req, res) {
	var resp = [];
	query = req.param("query");
	
	if (query) {
		sequelize.query(query).success(function(results) {
		if (results) {
			for (var s=0; s < results.length; s++) {
				resp.push(results[s]);
			}
		}
		res.send(resp);
		});
	} else {
		console.log("No query entered.");
		res.send(resp);
	}

});

https.createServer(options,app).listen(8089);
console.log('srs_update_db.js is running on port 8089');
exports = module.exports = app;
