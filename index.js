process.env.DEBUG = 'actions-on-google:*';

let express = require('express');
let bodyParser = require('body-parser');

let app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({type: 'application/json'}));

require('dotenv').config();

var { startClient } = require('./managerIf');
const { command, checkConnection } = require('./managerIf');

startClient()

const Assistant = require('actions-on-google').ApiAiApp;

app.post('/presentations', function (request, response) {
    const appName = "presentations";
    console.log("-------------------------------------------------------------");
    const assistant = new Assistant({request, response});

    function close(assistant) {
        console.log("close");
        assistant.tell("Closed");
    }

    function show(assistant) {
        console.log("show");

        let { sessionId, result, originalRequest } = request.body;
        console.log("show: " + JSON.stringify(request.body));
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
    actionMap.set('show', show);
    actionMap.set('identify', identify);
    actionMap.set('go', go);
    assistant.handleRequest(actionMap);
})
;
let server = app.listen(process.env.PORT || 8080, function () {
    let port = server.address().port;
    console.log('App listening on port %s', port);
});