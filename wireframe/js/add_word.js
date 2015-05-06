var express = require('express');
var app = express();

//Database related:
var Sequelize = require('sequelize');
var db_connection = require('../../badmemory/lib/secret_db').local;
var sequelize_options = { dialect: 'postgres', native: true };
console.log ("Opening connection to " + db_connection);
var sequelize = new Sequelize(db_connection, sequelize_options);
var models = require('../../badmemory/models').setup(sequelize);
sequelize.sync({force: false});
sequelize.authenticate().complete(function(err) { throw err; });
//sequelize.query('SELECT * FROM user_info;').success(function(myRows) {console.log(myRows)});

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });
 
app.get('/data', function(req, res){
	
	var toSend = "";
	var username = decodeURIComponent(req.url).substring(req.url.indexOf("&username=")+10, req.url.indexOf("&clicked_word"));
	var clicked_word = decodeURIComponent(req.url).substring(req.url.indexOf("&clicked_word=")+14, req.url.indexOf("&clicked_defn"));
	var clicked_defn = decodeURIComponent(req.url).substring(req.url.indexOf("&clicked_defn=")+14, req.url.length);

	if (username.slice(-1) === "\/") { username = username.substring(0, username.length-1) } //Strip end forwardslashes
	
	console.log("Username: " + username );
	console.log("Clicked word: " + clicked_word + "\n\n");
	
	sequelize.query('SELECT * FROM words WHERE "userId"=? AND "text"=?', null, {raw:true}, [username, clicked_word]).success(function(duplicate) {
		if (duplicate.length === 0) {
			// Insert page into Words table
			sequelize.query('INSERT INTO words VALUES(' + 'DEFAULT' + ',\'' + clicked_word + '\',\'' + clicked_defn + '\', LOCALTIMESTAMP, LOCALTIMESTAMP,\'' + username + '\')').success(function() {
				res.send("Successfully added '" + clicked_word + "' to " + username +"'s database.");
			});
		
		} else {
			console.log("This page has already been added to the user's repository.");
		}
	});
});


app.listen('8081');
console.log('Stuff happening on port 8081');
exports = module.exports = app;

