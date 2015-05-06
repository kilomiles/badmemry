var CSRF_HEADER = 'X-CSRF-Token';

var setCSRFToken = function(securityToken) {
  jQuery.ajaxPrefilter(function(options, _, xhr) {
    if ( !xhr.crossDomain ) 
        xhr.setRequestHeader(CSRF_HEADER, securityToken);
  });
};

setCSRFToken($('meta[name="csrf-token"]').attr('content'));