// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var user_functions  = require('./security_func.js');

// expose this function to our app using module.exports
module.exports = function(passport, User) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    // used to deserialize the user
    passport.deserializeUser(function(user, done) {
            done(null, user);
    });

 	// =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) 
    {
    	// asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {
            var signup_email = req.body.email;
            
            //check for username/password/email lengths serverside 
            if (username.length > 30)
            {
                return done(null, false, req.flash('signupMessage', 'Username length must be 30 characters or less.'));
            }
            else if (password.length > 60)
            {
                return done(null, false, req.flash('signupMessage', 'Password must be 60 characters or less.'));
            }
            else if (signup_email.length > 50)
            {
                return done(null, false, req.flash('signupMessage', 'Email must be 50 characters or less.'));
            }
            else if (password != req.body.password2)
            {
                return done(null, false, req.flash('signupMessage', 'Passwords must match.'));
            }
            
            
			// find a user whose email is the same as the forms email
			// we are checking to see if the user trying to login already exists
        	User.find({where: {username: username}}).success(function(user){
      			if (!user){
                    
      				//create user
      		        return user_functions.hash(password, User, signup_email, username, done);
      			}			 
      			else //user already exists 		 
        			return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
    	
    	});   
        });
	}));

//local login
 passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'login_username',
        passwordField : 'login_password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with email and password from our form
		// find a user whose email is the same as the forms email
		// we are checking to see if the user trying to login already exists
		User.find({where: {username: username}}).success(function(user){
      			if (!user){
      				//user doesn't exist 
      				return done(null, false, req.flash('loginMessage', 'No user found.'));
      			}	
      			else 
      			{
      				//try to authenticate user with given password
      				return user_functions.check_hash(password, user.password, done, req, user);
        		}
    	
    	});   	

    }));

};
	


