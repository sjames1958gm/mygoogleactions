const Assistant = require('actions-on-google').ApiAiApp;

const { command } = require('./managerIf');

module.exports = function (request, response, checkConnection) {
    const appName = "presentations";
    console.log("-------------------------------------------------------------");
    const assistant = new Assistant({request, response});

    function close(assistant) {
        console.log("close");
        if (!checkConnection(this)) return;

        let { sessionId, result, originalRequest } = request.body;
        let user = originalRequest ? originalRequest.data.user.userId : "testuser";

        command(user, appName, sessionId, result.action.toLowerCase(), 
            appName, function(status, sessionId, response, parm) {
                switch (status) {
                    case 0:
                        assistant.tell(`Closed`);
                    break;
                    case 1:
                        assistant.ask(`I don't recognize your identity, what is your username?`);
                    break;
                    default:
                        assistant.tell('Failed to close app');
                }
            
            }.bind(this)); 
    }

    function show(assistant) {
        console.log("show");
        if (!checkConnection(this)) return;

        let { sessionId, result, originalRequest } = request.body;
        let user = originalRequest ? originalRequest.data.user.userId : "testuser";

        let document = result.parameters.Document;
        let device = result.parameters.Device;
        let home = result.parameters.Home;

        if (home) {
            document = "all";
        }

        command(user, appName, sessionId, result.action.toLowerCase(), 
            document, device.toLowerCase(), function(status, sessionId, response, parm) {
                switch (status) {
                    case 0:
                        assistant.ask("Ok");
                    break;
                    case 1:
                        assistant.ask(`I don't recognize your identity, what is your username?`);
                    break;
                    default:
                        assistant.tell('Failed to open document');
                }
            
            }.bind(this));
    }

    function go(assistant) {
        console.log("go");
        if (!checkConnection(this)) return;

        // console.log(request.body.originalRequest.data.user.userId);
        let { sessionId, result, originalRequest } = request.body;
        let user = originalRequest ? originalRequest.data.user.userId : "testuser";

        let direction = result.parameters.Direction;
        
        command(user, appName, sessionId, result.action.toLowerCase(), 
            direction, function(status, sessionId, response, parm) {
                switch (status) {
                    case 0:
                        assistant.ask("Ok");
                    break;
                    case 1:
                        assistant.ask(`I don't recognize your identity, what is your username?`);
                    break;
                    default:
                        assistant.tell('Failed to complete request');
                }
            
            }.bind(this));
    }
    
    function move(assistant) {
        console.log("show");
        if (!checkConnection(this)) return;

        let { sessionId, result, originalRequest } = request.body;
        let user = originalRequest ? originalRequest.data.user.userId : "testuser";

        let device = result.parameters.Device;

        command(user, appName, sessionId, result.action.toLowerCase(), 
            "", device.toLowerCase(), function(status, sessionId, response, parm) {
                switch (status) {
                    case 0:
                        assistant.ask("Ok");
                    break;
                    case 1:
                        assistant.ask(`I don't recognize your identity, what is your username?`);
                    break;
                    default:
                        assistant.tell('Failed to move document');
                }
            
            }.bind(this));
    }

    function identify(assistant) {
        console.log("identify");
        if (!checkConnection(this)) return;
        
        // console.log(request.body.sessionId);
        let { sessionId, result, originalRequest } = request.body;
        let user = originalRequest ? originalRequest.data.user.userId : "testuser";

        let username = result.parameters.User;
        
        command(user, appName, sessionId, result.action.toLowerCase(), 
            username, function(status, sessionId, response, parm) {
                switch (status) {
                    case 0:
                        assistant.ask("User identity confirmed. Repeat your original request");
                    break;
                    
                    case 1:
                        assistant.ask(`I don't recognize your identity, what is your username?`);
                    break;
                    default:
                        assistant.tell('Failed to complete request');
                }
            
            }.bind(this));
    }
    
    function launch(assistant) {
        console.log("launch");
        if (!checkConnection(this)) return;
        
        // console.log(request.body.sessionId);
        let { sessionId, result, originalRequest } = request.body;
        let user = originalRequest ? originalRequest.data.user.userId : "testuser";

        command(user, appName, sessionId, 'Launch'.toLowerCase(), 
            function(status, sessionId, response, parm) {
                switch (status) {
                    case 0:
                        assistant.ask("Opened, select document");
                    break;
                    
                    case 1:
                        assistant.ask(`I don't recognize your identity, what is your username?`);
                    break;
                    default:
                        assistant.tell('Failed to complete request');
                }
            
            }.bind(this));
    }
    
    const actionMap = new Map();
    actionMap.set('close', close);
    actionMap.set('show', show);
    actionMap.set('identify', identify);
    actionMap.set('go', go);
    actionMap.set('move', move);
    actionMap.set('input.welcome', launch);
    assistant.handleRequest(actionMap);
}
