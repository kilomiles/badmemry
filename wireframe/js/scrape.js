var request = require('request');
var cheerio = require('cheerio');
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
//sequelize.query('SELECT * FROM user_info;').success(function(myRows) {console.log(myRows)});

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });
 
app.get('/data', function(req, res){
	
	var toSend = ""; //String to be sent to sentences.html
	var url = decodeURIComponent(req.url).substring(14, req.url.indexOf("&username"));
	var username = decodeURIComponent(req.url).substring(req.url.indexOf("&username=")+10, req.url.length);
	if (url.slice(-1) === "\/") { url = url.substring(0, url.length-1) } //Strip end forwardslashes
	if (username.slice(-1) === "\/") { username = username.substring(0, username.length-1) } //Strip end forwardslashes
	
	request({"uri": url}, function(err, resp, body) {
		var $ = cheerio.load(body);
		var title = $('title').text().replace(/[^a-z0-9\s\.\?\!\-\;\:]/gi, '').trim();
		console.log("Title: " + title);
		console.log("URL: " + url);
		console.log("Username: " + username + "\n\n");
		
		sequelize.query('SELECT * FROM pages WHERE "userId"=? AND (url=? OR title=?)', null, {raw:true}, [username, url, title]).success(function(duplicate) {

			//Insert page into Pages table
			sequelize.query('INSERT INTO pages VALUES(' + 'DEFAULT' + ',\'' + title + '\',\'' + url + '\', LOCALTIMESTAMP, LOCALTIMESTAMP,\'' + username + '\')').success(function() {
				sequelize.query('SELECT max(id) AS id FROM pages WHERE "userId"=?', null, { raw:true}, [username]).success(function(results) {
					$('form').remove(); //Remove forms since they contain no useful content
				 	$(':header, p').each(function() { //Examine text inside headers and paragraphs only
				 		var each = $(this).text().replace(/[^a-z0-9\s\.\?\!\-\;\:]/gi, '').trim(); //Remove non-alphanumeric and non-syntax characters
				 		each = each.replace(/ +(?= )/g,''); //Remove extra spaces
				 		var sentencesArray = each.match( /[^\.!\?]+[\.!\?]+/g ); //Split sentences by periods, exclamations and question marks.
						if (sentencesArray) {
							for (var i=0; i < sentencesArray.length; i++) {
				 				if (sentencesArray[i] !== "" && (sentencesArray[i].split(' ').length > 5)) { //Only keep non-tiny sentences.
									sentencesArray[i] = sentencesArray[i].replace(/ +(?= )/g,'');
				 					toSend += "<p class='translate'>" + sentencesArray[i] + "</p>";
				 					if (duplicate.length === 0) {
				 						sequelize.query('INSERT INTO sentences VALUES(' + 'DEFAULT' + ',\'' + sentencesArray[i] + '\', NULL, NULL, 0, 0.0, 2.5, LOCALTIMESTAMP, LOCALTIMESTAMP, \'' + username + '\',' + results[0].id + ')');
				 					}
				 				};
				 			}
						}
				 	});

				 	request({"uri": 'http://ws.detectlanguage.com/0.2/detect?q=' + toSend.replace(/ /g, "+") + '&key=e5f269de90c1a389d4ee614a7f55cf44'}, function(error, response, html) {
				 		if (!error && response.statusCode == 200) {
				 			res.send(toSend + "<p class='detected_language' style='visibility: hidden;'>" + html + "</p>");
				 		} else {
				 			res.send(toSend + "<p class='detected_language'>NOTICE: Language not found</p>");
				 		}
				 	});
				});
			});
		});	
	});
});


app.listen('8080');
console.log('Stuff happening on port 8080');
exports = module.exports = app;

