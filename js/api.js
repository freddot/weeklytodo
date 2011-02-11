var ok; // needed because some todoist api calls return only a string (without quotes) and when put in a script it otherwise generates undefined
var api = (function(){
    
    var APIToken = null;
    var projectName = 'weeklyTodoApp';
    var projectId = null;
    var activeCallback = null;
    var self = null;
    
    var APICall = function(action, params) {
        //log("action: " + action + ", params: " + params);
        // first of all: delete all script tags that aren't source, this is done to not clog up the markup.
        var scripttags = document.getElementsByTagName('script');
        for (var i = 0; i < scripttags.length; i++) {
            if (!scripttags[i].id) {
                document.getElementsByTagName('head')[0].removeChild(scripttags[i]);
            }
        }
        
        var querystringParameters = '';
        for (var param in params) {
            querystringParameters += param + "=" + params[param] + "&";
        }
        
        var callbackName = (self.callbackRouter[action + 'Callback'] ? action : 'default') + 'Callback';
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://todoist.com/API/' + action + '?' + querystringParameters + 'callback=api.callbackRouter.' + callbackName;
        
        log(script.src);
        document.getElementsByTagName('head')[0].appendChild(script);
        
    };
    
    var setCallback = function(cb) {
        // log("setCallback - cb: " + typeof cb + ", activeCallback: "+ activeCallback);
        //log("setCallback - cb: " + typeof cb);
        activeCallback = cb;
    };
    
    var callCallback = function(response) {
        activeCallback && activeCallback(response);
        activeCallback = null;
    };
    
    return self = {
        getUserValues: function() {
            //log("api.getUserValues - token: " + APIToken + ", projectId: " + projectId);
            return {
                token: APIToken,
                projectId: projectId
            };
        },
        setUserValues: function(userValues) {
            log("api.setUserValues - token: " + userValues.token + ", projectId: " + userValues.projectId);
            APIToken = userValues.token;
            projectId = userValues.projectId;
        },
        login: function(email, password, callback) {
            setCallback(callback);
            APICall('login', {
                email: email,
                password: password
            });
        },
        addTask: function(task, callback) {
            var qbody = {
                content: task.content,
                priority: 1,
                project_id: projectId,
                token: APIToken
            };
            task.due_date && (qbody.due_date = task.due_date);
            task.panic && (qbody.priority = 4);
            task.indent && (qbody.indent = task.indent);
            task.item_order && (qbody.item_order = task.item_order);
            
            setCallback(function(response) {
                callback(response);
            });
            
            APICall('addItem', qbody);
        },
        editTask: function(task, callback) {
            log("api.editTask - task: " + task);
            logobj(task);
            var qbody = {
                id: task.id,
                token: APIToken
            };
            setCallback(function(response) {
                callback(response);
            });
            task.content && (qbody.content = task.content);
            task.due_date && (qbody.date_string = task.due_date);
            task.indent && (qbody.indent = task.indent);
            task.panic && (qbody.priority = 4);
            task.item_order && (qbody.item_order = task.item_order);
            APICall('updateItem', qbody);
        },
        removeTask: function(id, callback) {
            //log("api.removeTask - id: " + id);
            setCallback(function(response) { // bleh. this is never called. awaiting reply at http://getsatisfaction.com/todoist/topics/todoist_api_deleteitems_not_adding_callback_function_when_adding_script_tag_dynamically
                //log("response: " + response);
                if (response !== 'ok') {
                    callback({error: "Could not remove task " + id});
                } else {
                    callback({message: "Removed task " + id});
                }
            });
            APICall('deleteItems', {
                ids: "[" + id + "]",
                token: APIToken
            });
        },
        checkTask: function(id, callback) {
            //log("api.checkTask - id: " + id);
            setCallback(callback);
            APICall('completeItems', {
                ids: "[" + id + "]",
                token: APIToken
            });
        },
        getUncompletedTasks: function(callback) {
            log("getUncompletedTasks");
            setCallback(function(response) {
                callback(response);
            });
            
            APICall('getUncompletedItems', {
                project_id: projectId,
                token: APIToken
            });
            
        },
        callbackRouter: {
            defaultCallback: function(response) {
                //log("defaultCallback - callCallback: " + typeof callCallback + ", response: "+ response);
                log("defaultCallback");
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
