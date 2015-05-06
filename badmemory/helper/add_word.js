// THIS FILE IS NO LONGER USED

var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var qs = require('querystring');

var forceSSL = require("express-force-ssl");
var https = require('https');
var fs = require('fs');
var options = {
    key: fs.readFileSync('lib/key.pem'),
    cert: fs.readFileSync('lib/cert.pem')
};

var app = express();
app.use(forceSSL);
app.set('httpsPort', 8081);

//Database related:
var Sequelize = require('sequelize');
var db_connection = require('../lib/secret_db').heroku;
var sequelize_options = { dialect: 'postgres', native: true };
console.log ("Opening connection to " + db_connection);
var sequelize = new Sequelize(db_connection, sequelize_options);
var models = require('../models').setup(sequelize);
sequelize.sync({force: false});
sequelize.authenticate().complete(function(err) { throw err; });

//Prevent cross-origin errors
app.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();
});

app.post('/add_word_data', function(req, res) {

	var query = qs.parse(req.url.split('?')[1]);
	var username = query.username;
	var clicked_word = query.clicked_word;
	var clicked_defn = query.clicked_defn;
	var clicked_examples = query.clicked_examples;
	
	// var username = decodeURIComponent(req.url).substring(req.url.indexOf('&username=')+10, req.url.indexOf('&clicked_word='));
	// var clicked_word = decodeURIComponent(req.url).substring(req.url.indexOf('&clicked_word=')+14, req.url.indexOf('&clicked_defn='));
	// var clicked_defn = decodeURIComponent(req.url).substring(req.url.indexOf('&clicked_defn=')+14, req.url.indexOf('&clicked_examples='));
	// var clicked_examples = decodeURIComponent(req.url).substring(req.url.indexOf('&clicked_examples=')+18, req.url.length);

	if (username.slice(-1) === "\/") { username = username.substring(0, username.length-1) } //Strip end forwardslashes
	
	console.log("Query: " + query);
	console.log("Username: " + username );
	console.log("Clicked word: " + clicked_word);
	console.log("Definition: " + clicked_defn);
	console.log("Examples: " + clicked_examples + "\n\n");
	
	sequelize.query('SELECT * FROM words WHERE "userId"=? AND "text"=?', null, {raw:true}, [username, encodeURIComponent(clicked_word)]).success(function(duplicate) {
		if (duplicate.length === 0) {
			// Insert page into Words table
				sequelize.query('INSERT INTO words VALUES(' + 'DEFAULT' + ',\'' + clicked_word.replace(/'/g, "''") + '\',\'' + clicked_defn.replace(/'/g, "''") + '\', LOCALTIMESTAMP, LOCALTIMESTAMP,\'' + username + '\', \'' + clicked_examples.replace(/'/g, "''") + '\')').success(function() {
				res.send("Successfully added '" + clicked_word.replace(/'/g, "''") + "' to " + username +"'s database.");
			});
		
		} else {
			console.log("This page has already been added to the user's repository.");
		}
	});
});


https.createServer(options,app).listen(8081);
console.log('add_word.js is running on port 8081');
exports = module.exports = app;

