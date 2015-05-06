//script for profile update 

function checkPasswordLength(){
    var password1 = $("input[name='new_password_1']").val();
    var password2 = $("input[name='new_password_2']").val();
    
    if(password1.length < 11 || password1 != password2)
    {
         $("#divCheckPassword").html("<p class='alert alert-danger'>Password needs to be at least 11 characters and match! </p>");
    }
    else 
    {
        $("#password_button").removeAttr("disabled");   
        $("#divCheckPassword").html("<p class='alert alert-success'>Password length okay! </p>");
    }    
    
}

function check_username(){
    var username = $("input[name='new_user_name']").val();
    
    if(username.length > 0)
    {
        $("#username_button").removeAttr("disabled");   
        $("#divCheckUser").html("<p class='alert alert-success'>Ready for change! </p>");
    }
    else 
    {
        $("#divCheckUser").html("<p class='alert alert-danger'>Username field cannot be empty! </p>");
    }
}

function check_email(){
    var email = $("input[name='new_email']").val();
    
    if(email.length > 0)
    {
        $("#email_button").removeAttr("disabled");  
        $("#divCheckEmail").html("<p class='alert alert-success'>Ready for change! </p>");
    }
    else 
    {
        $("#divCheckEmail").html("<p class='alert alert-danger'>New email can't be empty! </p>");
    }
}


$(document).ready(function () {
    //diable input button until all conditions are reached
    $("#username_button").attr("disabled", "true"); 
    $("#password_button").attr("disabled", "true"); 
    $("#email_button").attr("disabled", "true"); 
    
    $("input[name='new_user_name']").keyup(check_username);
    $("input[name='new_email']").keyup(check_email);
    $("input[name='new_password_2']").keyup(checkPasswordLength);
    
});