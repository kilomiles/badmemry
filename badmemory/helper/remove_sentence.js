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
	
	var username = decodeURIComponent(req.url).substring(req.url.indexOf("&username=")+10, req.url.indexOf("&clicked_word"));
	var id = decodeURIComponent(req.url).substring(req.url.indexOf("&sentence_id=")+14, req.url.length);

	if (username.slice(-1) === "\/") { username = username.substring(0, username.length-1) } //Strip end forwardslashes
	
	console.log("Username: " + username );
	console.log("Removing setence with ID: " + id + "\n\n");
	
	sequelize.query('DELETE FROM sentences WHERE "userId"=? AND "id"=?', null, {raw:true}, [username, id]).success(function(result) {
		if (!result) {
			res.send("Successfully removed sentence with ID '" + id + "' from " + username +"'s database.");
		} else {
			res.send("Error deleting user " + username + "'s sentence with ID " + id);
		}
	});
});


app.listen('8083');
console.log('remove_sentence.js is running on port 8083');
exports = module.exports = app;

