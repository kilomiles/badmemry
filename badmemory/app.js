var express = require('express');
var csrf = require('csurf');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var pg = require('pg');
var session = require('express-session');
var morgan = require('morgan');
var passport = require('passport');
var flash = require('connect-flash');

// === DATABASE SETUP ===
// Create a file called lib/secret_db.js as follows:
//
// module.exports = {
//   // local: "postgres://username:password@localhost:5432/database",
//   heroku: "postgres://username:password@hostname:5432/database"
// };
//
// This has entries for both our shared Heroku instance, as well as a local
// PostgreSQL database (if you are using one).
//
// Replace 'username', 'password', 'hostname', and 'database' with appropriate
// settings for connecting to the databases in question.
//
// Uncomment whichever of the following two you actually need:
//var db_connection = require("./lib/secret_db").local;
var db_connection = require("./lib/secret_db").heroku;

var Sequelize = require('sequelize');
var sequelize_options = { dialect: 'postgres', native: true };
console.log ("Opening connection to " + db_connection);
var sequelize = new Sequelize(db_connection, sequelize_options);

var models = require('./models').setup(sequelize);

// DANGEROUS BUT QUICK WAY OF RESETTING THE DATABASE
// Setting force: true makes it drop and re-create tables (deleting all data)!!
//sequelize.sync({force: true}); // <-- THAT'S THE DANGEROUS OPTION!!!
sequelize.sync({force: false});

// Our app will not be very useful without a database, so we just throw our
// error here if we happen to get one:
sequelize.authenticate().complete(function(err) { throw err; });

// TODOXXX cleanup below -- sequelize models stuff
var User = models.user;

// TODOXXX cleanup below -- passport stuff
var routes = require('./routes/main');
var routes_debug = require('./routes/debug');

var app = express();

//To allow cross-origin requests.
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  next();
 });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

//setting up the local-signup /signin
require('./helper/passport_function.js')(passport, User);

// setting up passport
app.use(session({ secret: 'the_secret_of_love_is_sacrifice', cookie: {  httpOnly: true, 
                                                                        proxy:true,
                                                                        secure: true,
                                                                        maxAge: 86000000 } })); 
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(csrf());
app.use(function(req, res, next) {
    res.locals.token = req.csrfToken();
    next();
});

app.use('/', routes(passport, models, sequelize));
if (app.get('env') === 'development') app.use('/admin', routes_debug);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            user: req.user || false
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        user: req.user || false
    });
});

module.exports = app;
