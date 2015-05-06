var express = require("express");
var fs = require('fs');
var sys = require('sys');
var logger = require('morgan');
var bodyParser = require('body-parser');
var request = require('request');
var methodOverride = require('method-override');

var app = express();
    app.use(logger());
    app.use(bodyParser());
    //app.set("view options", {layout: false});
    app.set('views', __dirname + '/../');
    app.engine('html', require('ejs').renderFile);
    app.use(express.static(__dirname + '/../'));
    app.use(methodOverride());

app.get('/heatmap', function(req, res){
  res.render('heatmap.html');
});

app.post('/heatmap', function(req, res){
  console.log('in post!');

 var siteURL = req.body['siteURL'];
 var siteData = '';
 request(siteURL, function (error, response, body) {
     if (!error && response.statusCode == 200) {
       res.write(body);
       siteData = body;
       res.end();
     }

   console.log(siteData);
   })

});

app.listen(4242);
console.log('Express server started');