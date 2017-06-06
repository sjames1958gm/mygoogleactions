const Assistant = require('actions-on-google').ApiAiApp;

const { command } = require('./managerIf');

module.exports = function (request, response, checkConnection) {
    const appName = "nzos";
    console.log("-------------------------------------------------------------");
    const assistant = new Assistant({request, response});

    function close(assistant) {
        console.log("close");
        if (!checkConnection(this)) return;

        let { sessionId, result, originalRequest } = request.body;
        let user = originalRequest ? originalRequest.data.user.userId : "testuser";
        
        let app = result.parameters.App;

        command(user, app, sessionId, result.action.toLowerCase(), 
            app, function(status, sessionId, response, parm) {
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

    function launch(assistant) {
        console.log("launch");
        if (!checkConnection(this)) return;

        let { sessionId, result, originalRequest } = request.body;
        let user = originalRequest ? originalRequest.data.user.userId : "testuser";
        
        let app = result.parameters.App;
        let device = result.parameters.Device;

        command(user, app, sessionId, result.action.toLowerCase(), 
            app, device, function(status, sessionId, response, parm) {
                switch (status) {
                    case 0:
                        assistant.ask("Ok");
                    break;
                    case 1:
                        assistant.ask(`I don't recognize your identity, what is your username?`);
                    break;
                    default:
                        assistant.tell('Failed to launch app');
                }
            
            }.bind(this));
    }
    
    function move(assistant) {
        console.log("show");
        if (!checkConnection(this)) return;

        let { sessionId, result, originalRequest } = request.body;
        let user = originalRequest ? originalRequest.data.user.userId : "testuser";

        let app = result.parameters.Document;
        let device = result.parameters.Device;

        command(user, app, sessionId, result.action.toLowerCase(), 
            app, device.toLowerCase(), function(status, sessionId, response, parm) {
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
    
    const actionMap = new Map();
    actionMap.set('close', close);
    actionMap.set('identify', identify);
    actionMap.set('move', move);
    actionMap.set('launch', launch);
    assistant.handleRequest(actionMap);
}
