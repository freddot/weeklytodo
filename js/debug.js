var debug = true;
var log = function(str) {
    if (debug) {
        console.log(str);
    }
};

var logobj = function logobj(obj, delimiter) {
    if (!debug) {
        return;
    }
    delimiter = delimiter || '';
    for (var o in obj) {
        if (typeof(obj[o]) !== 'object') {
            log(delimiter + o + ": " + obj[o]);
        } else {
            log(delimiter + o + ":");
            logobj(obj[o], delimiter + '   ');
        }
    }
};
