var gui = (function() {
    
    var currentData = {
        date: null,
        data: null
    };
    
    var commitTask = function(id, params) {
        log("commitTask - id: " + id);
        logobj(params);
        
        var task = params;
        
        if (id === null) {
            log("commitTask adding task");
            api.addTask(task, function(response) {
                setMessage("gui job: added task");
                setTimeout(fetchTasks, 500);
            });
            
        } else {
            log("commitTask editing task");
            task.id = parseInt(id);
            
            api.editTask(task, function(response) {
                // need some error handling here
                setMessage("gui job: edited task");
                setTimeout(fetchTasks, 500);
            });
        }
    };
    
    var getEditedFields = function(index) {
        var editedFields = { };
        function setEditedField(name) {
            var value = h.gid(name + index).value;
            if (value != currentData.data[index][name]) {
                editedFields[name] = value;
            }
        }
        setEditedField('content');
        setEditedField('due_date');
        //setEditedField('checked');
        return editedFields;
    };
    
    var removeTask = function(id) {
        log("removeTask - id: " + id);
        api.removeTask(id, function(response) { // callback doesn't work because of todoist api anomality
            logobj(response);
            if (response.error) {
                setMessage(response.error);
            } else {
                setMessage(response.message);
            }
            fetchTasks();
        });
    };
    
    var checkTask = function(id) {
        log("checkTask - id: " + id);
        api.checkTask(id, function(response) {
            log("reponse: " + response);
        });
    };
    
    var fetchTasks = function() {
        api.getUncompletedTasks(function(response) {
            currentData.data = response;
            showTasks(currentData.date);
        });
    };
    
    var showTasks = function(date) {
        var str = "";
        var data = currentData.data.slice(0);
        for (var i = 0; i < data.length; i++) {
            var duedate = new Date(data[i].due_date);
            if (
                (duedate.getWeek() < date.getWeek() && duedate.getFullYear() > date.getFullYear()) ||
                (duedate.getWeek() > date.getWeek() && duedate.getFullYear() >= date.getFullYear())
            ) {
                data.splice(i, 1);
                i--;
            }
        }
        
        currentData.data = data;
        
        for (var i = 0; i < data.length; i++) {
            var indent = "";
            for (var j = 1; j < data[i].indent; j++) {
                indent += "&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;";
            }
            var duedate = new Date(data[i].due_date);
            var datestr = "";
            var overdue = "";
            if (data[i].due_date) {
                datestr = duedate.todoStringMinute();
                if (duedate.getWeek() < date.getWeek()) {
                    weekstr = "od";
                }
            }
            var onchangestr = 'onchange="gui.action(gui.actions.BEGINEDIT, {index: ' + i + '})"';
            str += '<div class="task">' +
                '<input id="checked' + i + '" type="checkbox" ' + onchangestr + ' />' +
                '<input id="content' + i + '" type="text" value="' + indent + data[i].content + '" ' + onchangestr + ' size=55 />' +
                '<input id="due_date' + i + '" type="text" ' + onchangestr + ' value="' + datestr + '" size=15 />' +
                '<div style="float: right; margin: 0;">' + 
                '<input type="button" onclick="gui.action(gui.actions.COMMITTASK, {id: ' + data[i].id + ', index: ' + i + '})" style="display: none;" id="commit_' + i + '" value="commit" />' +
                '</div>' + 
                '</div>';
        }
        h.gid("subtitle").innerHTML = "week " + date.getWeek();
        h.gid('tasks').innerHTML = str;
    };
    
    var setMessage = function(message, type) {
        var hours = new Date().getHours();
        hours = (hours < 10 ? "0" : "") + hours;
        var minutes = new Date().getMinutes();
        minutes = (minutes < 10 ? "0" : "") + minutes;
        h.gid('message').innerHTML = "<em>" + hours + ":" + minutes + "</em> - " + message;
    };
    
    
    return self = {
        login: function() {
            setMessage('logging in...');
            api.login(h.gid('email').value, h.gid('password').value, self.loggedIn);
        },
        loggedIn: function(data) {
            setMessage(data.message);
            if (!data.error) {
                var userValues = api.getUserValues();
                window.location = "main.html?token=" + userValues.token + "&projectId=" + userValues.projectId;
            }
        },
        init: function() {
            log("init - token: " + h.gqs('token') + ", pid: " + h.gqs('project_id') + ", self: " + self);
            api.setUserValues({
                token: h.gqs('token'),
                projectId: h.gqs('project_id')
            });
            currentData.date = new Date();
            fetchTasks();
        },
        actions: {
            BEGINNEWTASK: "begin new task",
            NEXTWEEK: "next week",
            PREVWEEK: "previous week",
            RELOADTASKS: "reload tasks",
            BEGINEDIT: "begin edit",
            COMMITTASK: "commit task"
        },
        action: function(actionName, params) {
            setMessage("gui job: " + actionName + "...");
            
            switch(actionName) {
                case self.actions.BEGINNEWTASK:
                currentData.data.push({});
                showTasks(currentData.date);
                break;
                
                case self.actions.NEXTWEEK:
                currentData.date.offsetByWeek(1);
                showTasks(currentData.date);
                break;
                
                case self.actions.PREVWEEK:
                currentData.date.offsetByWeek(-1);
                showTasks(currentData.date);
                break;
                
                case self.actions.RELOADTASKS:
                fetchTasks();
                break;
                
                case self.actions.BEGINEDIT:
                h.gid("commit_" + params.index).style.display = "";
                break;
                
                case self.actions.COMMITTASK:
                commitTask(params.id || null, getEditedFields(params.index));
                h.gid("commit_" + params.index).style.display = "none";
                break;
            }
        }
    };
})();
