
var debug = true;
var log = function(str) {
    if (debug) {
        console.log(str);
    }
};

var logobj = function logobj(obj, delimiter) {
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


Date.prototype.todoString_day = function() {
    return this.getDate() + "-" + (this.getMonth() + 1) + "-" + this.getFullYear();
};

Date.prototype.todoString_minute = function() {
    return this.todoString_day() + " @ " + this.getHours() + ":" + this.getMinutes();
};

Date.prototype.getWeek = function () {
    var a, b, c, d, e, f, g, n, s, w;
    
    var $y = this.getFullYear();
    var $m = this.getMonth() + 1;
    var $d = this.getDate();

    if ($m <= 2) {
        a = $y - 1;
        b = (a / 4 | 0) - (a / 100 | 0) + (a / 400 | 0);
        c = ((a - 1) / 4 | 0) - ((a - 1) / 100 | 0) + ((a - 1) / 400 | 0);
        s = b - c;
        e = 0;
        f = $d - 1 + (31 * ($m - 1));
    } else {
        a = $y;
        b = (a / 4 | 0) - (a / 100 | 0) + (a / 400 | 0);
        c = ((a - 1) / 4 | 0) - ((a - 1) / 100 | 0) + ((a - 1) / 400 | 0);
        s = b - c;
        e = s + 1;
        f = $d + ((153 * ($m - 3) + 2) / 5) + 58 + s;
    }
    
    g = (a + b) % 7;
    d = (f + g - e) % 7;
    n = (f + 3 - d) | 0;

    if (n < 0) {
        w = 53 - ((g - s) / 5 | 0);
    } else if (n > 364 + s) {
        w = 1;
    } else {
        w = (n / 7 | 0) + 1;
    }
    
    $y = $m = $d = null;

    return w;
};


var api = (function(){
    
    var APIToken = null; //'2a527723c0f3b19916f7eaaa8fdf70c72fa6a6de';
    var projectName = 'weeklyTodoApp';
    var projectId = null;
    var activeCallback = null;
    var self = null;
    
    var APICall = function(action, params) {
        var querystringParameters = '';
        for (var param in params) {
            querystringParameters += param + "=" + params[param] + "&";
        }
        log("APICall - self: "+ self);
        var callbackName = (self.callbackRouter[action + 'Callback'] ? action : 'default') + 'Callback';
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://todoist.com/API/' + action + '?' + querystringParameters + 'callback=api.callbackRouter.' + callbackName;
        // log("after setting src");
        log(script.src);
        document.getElementsByTagName('head')[0].appendChild(script);
        // log("appended script");
    };
    
    var setCallback = function(cb) {
        log("setCallback - cb: " + typeof cb + ", activeCallback: "+ activeCallback);
        activeCallback = cb;
    };
    
    var callCallback = function(response) {
        // delete all script tags that aren't source, this is just to not clog up the html.
        /*
        var scripttags = document.getElementsByTagName('script');
        for (var i = 0; i < scripttags.length; i++) {
            if (!scripttags[i].id) {
                document.getElementsByTagName('head')[0].removeChild(scripttags[i]);
            }
        }
        */
        activeCallback && activeCallback(response);
        activeCallback = null;
    };
    
    return self = {
        login: function(email, password, cb) {
            setCallback(cb);
            APICall('login', {
                email: email,
                password: password
            });
        },
        setTask: function(content, endTime, cb) {
            setCallback(function(response) {
                cb(response);
            });
            var body = {
                content: content,
                project_id: projectId,
                token: APIToken
            };
            endTime && (body.endTime = endTime);
            APICall('addItem', body);
        },
        getWeeklyTasks: function(date, cb) {
            log("getWeeklyTasks");
            /*setCallback(function(response) {
                log("getWeeklyTasks - setCallback(anon)");
                var data = [];
                for (var i = 0; i < response.length; i++) {
                    // log("due date: " + response[i].due_date);
                    var pushit = false;
                    if (response[i].due_date !== null) {
                        var duedate = new Date(response[i].due_date);
                        if (duedate.getFullYear() > date.getFullYear() || (duedate.getFullYear() === date.getFullYear() && duedate.getWeek() >= date.getWeek())) {
                            pushit = true;
                        }
                    } else {
                        pushit = true;
                    }
                    if (pushit) {
                        data.push(response[i]);
                    }
                }
                log("anon - cb: " + cb);
                cb(data);
            });*/
            setCallback(cb);
            log("APIToken: "+ APIToken + ", projectId: "+ projectId);
            APICall('getUncompletedItems', {
                project_id: projectId,
                token: APIToken
            });
            
        },
        callbackRouter: {
            defaultCallback: function(response) {
                log("defaultCallback - callCallback: " + typeof callCallback + ", response: "+ response);
                callCallback(response);
            },
            loginCallback: function(response) {
                if (!response.api_token) {
                    callCallback({message: response, error: true});
                    return;
                }
                APIToken = response.api_token;
                APICall('getProjects', {
                    token: APIToken
                });
            },
            getProjectsCallback: function(response) {
                
                var exists = false;
                for (var i = 0; i < response.length; i++) {
                    if (response[i].name === projectName) {
                        projectId = response[i].id;
                        exists = true;
                        break;
                    }
                }
                if (!exists) {
                    APICall('addProject', {
                        name: projectName,
                        token: APIToken
                    });
                } else {
                    callCallback({message: "logged in"});
                }
            },
            addProjectCallback: function(response) {
                for (var i = 0; i < response.length; i++) {
                    if (response[i].name === projectName) {
                        api.setProjectId(response[i].id);
                        break;
                    }
                }

                callCallback({message: "logged in and created 'weeklyTodoApp'-list on todoist"});
                
            }
        }
    };
})();

// DOM helper
var h = (function() {
    return self = {
        gid: function(id) {
            return document.getElementById(id);
        },
        gtag: function(tagname, index) {
            return document.getElementsByTagName(tagname)[index || 0];
        }
    };
})();


var weeklyTodoGUI = (function() {
    
    var viewFactory = function(divId, title) {
        return {
            divId: divId,
            title: title
        };
    };
    
    var views = {
        login: viewFactory('login_view', 'login'),
        weekly: viewFactory('weekly_view', 'weekly todos')
    };
    
    var currentView = views.login;
    
    return self = {
        login: function() {
            self.setMessage('logging in...');
            api.login(h.gid('email').value, h.gid('password').value, self.loggedIn);
        },
        loggedIn: function(data) {
            self.setMessage(data.message);
            if (!data.error) {
                self.setMessage("wait while fetching todo for current week...");
                self.showView(views.weekly);
                setTimeout(function() {
                    self.setMessage("todo fetched");
                    self.showWeek(new Date());
                }, 1000);
            }
        },
        showWeek: function(date) {
            log("showWeek");
            api.getWeeklyTasks(new Date(), function(data) {
                log("data: " + data);
                var str = '';
                for (var i = 0; i < data.length; i++) {
                    str += data[i].content + " - <em>" + data[i].due_date + "</em><br/>";
                }
                log("str: "+ str);
                h.gid(currentView.divId).innerHTML = str;
            });
        },
        setMessage: function(message, type) {
            h.gid('message').innerHTML = "<em>" + new Date().getHours() + ":" + new Date().getMinutes() + "</em> - " + message;
        },
        showView: function(view) {
            h.gid(currentView.divId).style.display = "none";
            currentView = view;
            h.gid(currentView.divId).style.display = "inline";
            h.gid('title').innerHTML = currentView.title;
        }
    };
})();


