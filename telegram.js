const Assistant = require('actions-on-google').ApiAiApp;

// -----------------
// No longer used - requests forwarded to generic nzos.js
// -----------------

const { command } = require('./managerIf');

module.exports = function (request, response, checkConnection) {
    const appName = "telegram";
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

    function contact(assistant) {
        console.log("show");
        if (!checkConnection(this)) return;

        let { sessionId, result, originalRequest } = request.body;
        let user = originalRequest ? originalRequest.data.user.userId : "testuser";

        let contact = result.parameters.User;

        command(user, appName, sessionId, result.action.toLowerCase(), 
            contact, function(status, sessionId, response, parm) {
                switch (status) {
                    case 0:
                        assistant.ask(`${contact} selected, what is your message, for example say 'send' followed by your message.`);
                    break;
                    case 1:
                        assistant.ask(`I don't recognize your identity, what is your username?`);
                    break;
                    default:
                        assistant.tell('Failed to open document');
                }
            
            }.bind(this));
    }

    function send(assistant) {
        console.log("go");
        if (!checkConnection(this)) return;

        // console.log(request.body.originalRequest.data.user.userId);
        let { sessionId, result, originalRequest } = request.body;
        let user = originalRequest ? originalRequest.data.user.userId : "testuser";
        
        var text = result.resolvedQuery.replace(/^send /, '');

        command(user, appName, sessionId, result.action.toLowerCase(), 
            text, function(status, sessionId, response, parm) {
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
                        assistant.ask("Opened, select contact");
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
    actionMap.set('contact', contact);
    actionMap.set('send', send);
    actionMap.set('move', move);
    actionMap.set('launch', launch);
    actionMap.set('input.welcome', launch);
    assistant.handleRequest(actionMap);
};