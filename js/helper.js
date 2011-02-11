
// helper
var h = (function() {
    return self = {
        gid: function(id) {
            return document.getElementById(id);
        },
        gtag: function(tagname, index) {
            return document.getElementsByTagName(tagname)[index || 0];
        },
        gqs: function (key, default_) {
            key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
            var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
            var qs = regex.exec(window.location.href);
            if(!qs) {
                return default_ || "";
            }
            return qs[1];
        }
    };
})();
