//These functions help validate user input so that password lengths 
//are greater than 11 characters, and that passwords match, etc
//it disables the button unless all form data is filled
//will do the same thing on the serverside as well 

function checkPasswordLength(){
    var password = $("input[name='password']").val();
    
    if(password.length < 11)
    {
         $("#divCheckPasswordMatch").html("<p class='alert alert-danger'>Password needs to be at least 11 characters! </p>");
    }
    else 
    {
        $("#divCheckPasswordMatch").html("<p class='alert alert-success'>Password length okay! </p>");
    }    
    
}

function checkPasswordMatch() {
    var password = $("input[name='password']").val();
    var confirmPassword = $("input[name='password2']").val();
    var username = $("input[name='username']").val();
    var email = $("input[name='email']").val();
    
    if (password != confirmPassword)
        $("#divCheckPasswordMatch").html("<p class='alert alert-danger'>Passwords do not match! </p>");
    else if(password == confirmPassword && username.length > 0 && email.length > 0)
    {
        $("#password_button").removeAttr("disabled");   
        $("#divCheckPasswordMatch").html("<p class='alert alert-success'>Passwords match! </p>");
    }
}

$(document).ready(function () {
    //diable input button until all conditions are reached
    $("#password_button").attr("disabled", "true"); 
    
    $("input[name='password2']").keyup(checkPasswordMatch);
    $("input[name='password']").keyup(checkPasswordLength);
    
});

