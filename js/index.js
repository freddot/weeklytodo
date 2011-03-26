
var weeklytodo = (function() {
    
    var scope = "http://www.blogger.com/feeds";
    var currentData;
    
    var init = function() {
        setMessage("initializing...");
        
        if (!google.accounts.user.checkLogin(scope)) {
            showLoggedOut();
            setMessage("log in failed mysteriously...");
            return;
        }
        showLoggedIn();
        
        postGetter(function(post) {
            if (post && post.error) {
                setMessage(post.error);
                return;
            }
            try {
                var today = new Date();
                var createNew = false;
                var newContent = "";
                    
                if (!post) {
                    createNew = true;
                } else {
                    var created = new Date(post.getPublished().$t);
                    if (created.getFullYear() !== today.getFullYear() || (created.getFullYear() === today.getFullYear() && created.getWeek() !== today.getWeek())) {
                        createNew = true;
                        rows = post.getContent().getText().split('<br />');
                        re = /^\s*done/gi;
                        for (var i = 0, row; i < rows.length; i++) {
                            row = rows[i];
                            // console.log("RE: " + row.match(re) + " - " + row);
                            if (row.match(re) === null) {
                                // console.log("adding: " + row);
                                newContent += row + '\n';
                            }
                        }
                    }
                }
                
                // log("newContent: " + newContent);
                
                if (createNew) {
                    setMessage("creating new post for this week...");
                    postCreator(today.getFullYear() + " week " + today.getWeek(), newContent, getWeek);
                } else {
                    defaultCallback(post);
                }
            } catch(e) {
                setMessage(e);
            }
        });
    };
    
    var defaultCallback = function(data) {
        if (data.error) {
            setMessage(data.error);
        } else {
            setCurrentData(data);
        }
    };
    
    var getWeek = function() {
        setMessage("fetching data...");
        postGetter(defaultCallback);
    };
    
    var setCurrentData = function(post) {
        setEnableCommit(false);
        currentData = {
            title: post.getTitle().getText(),
            content: post.getContent().getText().split('<br />').join('\n')
        };
        h.gid('title').innerHTML = currentData.title;
        h.gid('content').value = currentData.content;
        setMessage("done!");
    };
    
    var setMessage = function(message) {
        var now = new Date();
        var hours = (now.getHours() < 10 ? "0" : "") + now.getHours();
        var minutes = (now.getMinutes() < 10 ? "0" : "") + now.getMinutes();
        var seconds = (now.getSeconds() < 10 ? "0" : "") + now.getSeconds();
        h.gid('message').innerHTML = hours + ":" + minutes + ":" + seconds + " - " + message;
    };
    
    var commit = function() {
        setEnableCommit(false);
        setMessage("committing todo...");
        postUpdater(currentData.title, h.gid('content').value, getWeek);
    };
    
    var logIn = function() {
        google.accounts.user.login(scope);
    };
    
    var logOut = function() {
        google.accounts.user.logout();
        showLoggedOut();
    };
    
    var showLoggedIn = function() {
        h.gid('content').disabled = false;
        h.gid('commit').disabled = false;
        h.gid('title').innerHTML = "";
        h.gid('logout').style.display = "";
        h.gid('login').style.display = "none";
        setMessage('you are logged in');
    };
    
    var showLoggedOut = function() {
        h.gid('content').disabled = true;
        h.gid('commit').disabled = true;
        h.gid('title').innerHTML = "you are not logged in";
        h.gid('logout').style.display = "none";
        h.gid('login').style.display = "";
        setMessage('you are not logged in');
    };
    
    var setEnableCommit = function(enable) {
        h.gid('commit').disabled = !enable;
    };
    
    return {
        init: init,
        commit: commit,
        logIn: logIn,
        logOut: logOut,
        setEnableCommit: setEnableCommit
    };
})();



//google.load("gdata", "1.s");
google.load("gdata", "2.x", { packages : ["blogger"] });
google.setOnLoadCallback(function() {
    bloggerService = new google.gdata.blogger.BloggerService('weeklytodo-1.0');
    weeklytodo.init();
});
