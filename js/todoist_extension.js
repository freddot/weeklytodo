// lets hoppas fedt nu... :D
var debug = true;
var log = function(str) {
    if (debug) {
        console.log(str);
    }
};

var objlog = function objlog(obj, delimiter) {
    delimiter = delimiter || '';
    for (var o in obj) {
        if (typeof(obj[o]) !== 'object') {
            log(delimiter + o + ": " + obj[o]);
        } else {
            log(delimiter + o + ":");
            objlog(obj[o], delimiter + '   ');
        }
    }
};


var todoistInterface = (function(){
    
    var APIToken = '2a527723c0f3b19916f7eaaa8fdf70c72fa6a6de';
    
    return self = {
        login: function(email, password) {
            
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://todoist.com/API/login?token=' + APIToken + '&email=' + email + '&password=' + password + '&callback=todoistInterface.callback';
            document.getElementsByTagName('head')[0].appendChild(script);
            log(email + " logged in!");
        },
        
        callback: function(response) {

            objlog(response);
            
        }
    };
})();

