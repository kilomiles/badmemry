//security functions 

var bcrypt = require("bcrypt");
var pg = require ("pg");


//will switch to async in assignment 3 
function hash(plain_text_psw, User, signup_email, username, done)
{   
    bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(plain_text_psw, salt, function(err, hash) {
        if (err)
        {
            console.log("Password generation error");
            return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
        }
        else 
        {
            User.create({
                            username    : username,
      		                email 		: signup_email,	
      						password 	: hash,
      		           })
      					 .complete(function(err, user){
      					 		if (err)
      					 		{
      					 			console.log("error is : " + err);
      					 			throw err;
      					 		}
      					 		console.log("Insert Success!");
      					 		return done(null, user);
      					 })
        }
        });
    });
}

function check_hash(user_entered_password, hash, done, req, user)
{
	return bcrypt.compare(user_entered_password, hash, function(err, res)
                          {
                              if (err)
                              {
                                  console.log("Bcrypt comparison error")
                                  return false; 
                              }
                              else 
                              { 
                                if(res) //success
                                {   
      					            return done(null, user);
                                }
      				            else //wrong password
      				              {
                                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); 
      				              }     
                              }
                              
                          });
};

function user_update_check_password(request, result, user, body, sequelize, updateFunction, re_route)
{
    bcrypt.compare(body.user_password, user.password, function(err, res)
                          {
                             if(err)
                             {
                                console.log("Bcrypt comparison error")
                                re_route("password_check_failed", request, result);
                             }
                              else 
                              {
                                  if(res) //success
                                  {
                                    updateFunction(request, result, user, body, sequelize, re_route);
                                  }
                                  else 
                                  {
                                    console.log("password comparison failed");
                                    re_route("password_check_failed", request, result);
                                  }
                              }
                              
                              
                          });
}

module.exports.check_hash = check_hash;
module.exports.hash = hash; 
module.exports.user_update_check_password = user_update_check_password;