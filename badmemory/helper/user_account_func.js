//User Account Functions
//Allows us to update account information or delete the account

var bcrypt = require("bcrypt");


//actually execute the update 
function execute_update(request, result, user, body, sequelize, re_route)
{
    var action   = body.profile_button;
    var password = user.password;
    
    if (action == "username_button")
    {
       //get new username
       var new_user_name = body.new_user_name;
        
       //chec new password length
       if (new_user_name.length > 30)
       {
           re_route("update_length", request, result);
       }
       else 
       {
       //set new username 
       sequelize.query("UPDATE user_info SET username = '" + new_user_name + "' WHERE password='" + password + "';")
       .success(function(){
           console.log("username update success");
           request.user.username = new_user_name;
           re_route("update_success", request, result);
       })
       .error(function(err)
                   {
                       // throw err; 
                        console.log("error with code : " + err);
                        re_route("user_exists", request, result);
                   });
       }
    }
        else if (action == "email_button") //change email
    {
        //new email
        var new_email = body.new_email;
        
       if (new_email.length > 50)
       {
           re_route("update_length", request, result);
       }
       else 
       {
        //set new email 
        sequelize.query("UPDATE user_info SET email = '" + new_email + "' WHERE password='" + password + "';")
            .success(function()
                     {
                        console.log("email update success");
                        re_route("update_success", request, result);
                     }
            );
       }
    }
    else if (action == "password_button") //changepassword
    {
        //new password
        
        if(body.new_password_1.length > 60)
        {
            re_route("update_length", request, result);
        }
        else 
        {
        var salt        = bcrypt.genSaltSync(10);
        var newpassword = bcrypt.hashSync(body.new_password_1, salt);
        request.user.password = newpassword; 
        //set new email 
       sequelize.query("UPDATE user_info SET password = '" + newpassword + "' WHERE password='" + password + "';").success(function(){
           console.log("password update success");
           re_route("update_success", request, result);
       });
        }
        
    }
    else if (action == "delete_button") //delete account 
    {
        username = request.user.username;
        
        //delete user and table rows associated with said user
        sequelize.query("DELETE FROM user_info WHERE password='" + password + "' AND username = '" + username + "';").success(function(){
           
           sequelize.query("DELETE FROM words WHERE \"userId\"='" + username + "';").success(function(){
               
               sequelize.query("DELETE FROM sentences WHERE \"userId\"='" + username + "';").success(function() {
                   
                   sequelize.query("DELETE FROM pages WHERE \"userId\"='" + username + "';").success(function(){
                       console.log("account deletion success");
                       re_route("delete_success", request, result);   
                   });
               });
           });
           
       });
    } 
}

module.exports.execute_update = execute_update;