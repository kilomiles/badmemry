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
app.set('httpsPort', 8080);

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

//Receieve and handle GET request 
app.get('/data', function(req, res){
	var toSend = ""; //String to be sent to sentences.html
  	var query = qs.parse(req.url.split('data?')[1]);
	  var username = query.username;
	  var password = query.p;
	  var url = query.web_url;

  // var url = decodeURIComponent(req.url).substring(14, req.url.indexOf("&username"));
  // //var username = decodeURIComponent(req.url).substring(req.url.indexOf("&username=")+10, req.url.length);
  // var username = decodeURIComponent(req.url).substring(req.url.indexOf("&username=")+10, req.url.indexOf("&p="));
  // console.log("Username: " + username);
  // var password = decodeURIComponent(req.url).substring(req.url.indexOf("&p=")+3, req.url.length);
  // if (url.slice(-1) === "\/") { url = url.substring(0, url.length-1) } //Strip end forwardslashes
  // if (username.slice(-1) === "\/") { username = username.substring(0, username.length-1) } //Strip end forwardslashes
	
	request({"uri": url}, function(err, resp, body) {
		var $ = cheerio.load(body);
		var title = $('title').text().trim();
		console.log("Title: " + title);
		console.log("URL: " + url);
		console.log("Username: " + username);
		console.log("Password: " + password +"\n");
		
		//Only do things to database if user is authenticated
		sequelize.query('SELECT password FROM user_info WHERE username=?', null, {raw:true}, [username]).success(function(pass) {
			if (password === pass[0].password) {
				sequelize.query('SELECT * FROM pages WHERE "userId"=? AND (url=? OR title=?)', null, {raw:true}, [username, url, title]).success(function(duplicate) {

					//Insert page into Pages table if it doesn't exist
					if (duplicate.length === 0) {
						sequelize.query('INSERT INTO pages VALUES(' + 'DEFAULT' + ', ?, ?, LOCALTIMESTAMP, LOCALTIMESTAMP, ?)', null, {raw:true}, [title, url, username]);
					}
					
					sequelize.query('SELECT max(id) AS id FROM pages WHERE "userId"=? AND "url"=?', null, { raw:true}, [username, url]).success(function(results) {
						$('form').remove(); //Remove forms since they contain no useful content
					 	$(':header, span, p').each(function() { //Examine text inside headers and paragraphs only
   						var each = $(this).text().trim(); //Remove non-alphanumerics
					 		each = each.replace(/ +(?= )/g,''); //Remove extra spaces
					 		var sentencesArray = each.match( /[^\.!\?]+[\.!\?]+/g ); //Split sentences by periods, exclamations and question marks.
							if (sentencesArray) {
								for (var i=0; i < sentencesArray.length; i++) {
					 				if (sentencesArray[i] !== "" && (sentencesArray[i].split(' ').length > 5)) { //Only keep non-tiny sentences.
										sentencesArray[i] = sentencesArray[i].replace(/ +(?= )/g,'');
					 					toSend += "<p class='translate'>" + sentencesArray[i] + "</p>";
					 					if (duplicate.length === 0) {
					 						sequelize.query('INSERT INTO sentences VALUES(' + 'DEFAULT' + ',:sentence, NULL, NULL, 0, 0, 2.5, LOCALTIMESTAMP, LOCALTIMESTAMP, \'' + username + '\',' + results[0].id + ')', null, {raw:true}, {sentence: sentencesArray[i]});
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
			}	
		});
			
	});
});


https.createServer(options,app).listen(8080);
console.log('Scraping website on port 8080');
exports = module.exports = app;

