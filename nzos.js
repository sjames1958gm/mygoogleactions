const Assistant = require('actions-on-google').ApiAiApp;

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const {
  command
} = require('./managerIf');

function emitResponse(assistant, response, defaultResponse, parm, defaultParm) {
  response = response !== "" ? response : defaultResponse;
  parm = parm !== "" ? parm : defaultParm;

  console.log(`assistant.${response}(${parm})`);

  if (response === "tell") {
    assistant.tell(parm);
  }
  else if (response === "ask") {
    assistant.ask(parm);
  }
  else {
    assistant.tell("Error in response type");
  }
}

module.exports = function(request, response, checkConnection, appName) {
  console.log("-------------------------------------------------------------");
  const assistant = new Assistant({
    request,
    response
  });
  
  
  console.log(`AppName: ${appName}`);

  function launch(assistant) {
    console.log("launch");
    if (!checkConnection(assistant)) return;

    let {
      sessionId,
      result,
      originalRequest
    } = request.body;

    appName = appName || result.parameters.App;

    let user = originalRequest ? originalRequest.data.user.userId : "testuser";
    let device = result.parameters.Device;

    command(user, device, appName, sessionId, result.action.toLowerCase(),
      appName,
      function(status, sessionId, response, parm) {
        switch (status) {
          case 0:
            emitResponse(assistant, response, "ask", parm, `Ok, ${appName} launched`);
            break;
          case 1:
            emitResponse(assistant, response, "ask", parm, `I don't recognize your identity, what is your username?`);
            break;
          case 2:
            emitResponse(assistant, response, "ask", parm, `Please specify the target device?`);
            break;
          default:
            emitResponse(assistant, response, "tell", parm, 'Failed to launch app');
        }

      }.bind(this));
  }

  function move(assistant) {
    console.log("show");
    if (!checkConnection(assistant)) return;

    let {
      sessionId,
      result,
      originalRequest
    } = request.body;
    let user = originalRequest ? originalRequest.data.user.userId : "testuser";

    appName = appName || result.parameters.App;
    let device = result.parameters.Device;

    command(user, device.toLowerCase(), appName, sessionId, result.action.toLowerCase(),
      appName, function(status, sessionId, response, parm) {
        switch (status) {
          case 0:
            emitResponse(assistant, response, "ask", parm, `Ok, Moved to ${device}`);
            break;
          case 1:
            emitResponse(assistant, response, "ask", parm, `I don't recognize your identity, what is your username?`);
            break;
          default:
          emitResponse(assistant, response, "tell", parm, 'Failed to move app');
        }

      }.bind(this));
  }

  function close(assistant) {
    console.log("close");
    if (!checkConnection(assistant)) return;

    let {
      sessionId,
      result,
      originalRequest
    } = request.body;
    
    appName = appName || result.parameters.App;

    let user = originalRequest ? originalRequest.data.user.userId : "testuser";

    command(user, "", appName, sessionId, result.action.toLowerCase(),
      appName,
      function(status, sessionId, response, parm) {
        switch (status) {
          case 0:
            emitResponse(assistant, response, "tell", parm, `${appName} closed`);
            break;
          case 1:
            emitResponse(assistant, response, "ask", parm, `I don't recognize your identity, what is your username?`);
            break;
          default:
            emitResponse(assistant, response, "tell", parm, 'Failed to close app');
          break;
        }

      }.bind(this));
  }

  function identify(assistant) {
    console.log("identify");
    if (!checkConnection(assistant)) return;

    // console.log(request.body.sessionId);
    let {
      sessionId,
      result,
      originalRequest
    } = request.body;
    let user = originalRequest ? originalRequest.data.user.userId : "testuser";

    appName = appName || result.parameters.App;
    let username = result.parameters.User;

    command(user, "", appName, sessionId, result.action.toLowerCase(),
      username,
      function(status, sessionId, response, parm) {
        switch (status) {
          case 0:
            emitResponse(assistant, response, "ask", parm, `User identity confirmed. Repeat your original request`);
            break;
          case 1:
            emitResponse(assistant, response, "ask", parm, `I don't recognize your identity, what is your username?`);
            break;
          default:
            emitResponse(assistant, response, "tell", parm, 'Failed to complete request');
        }

      }.bind(this));
  }
  
  function unhandled(assistant) {
    if (!checkConnection(assistant)) return;

    // console.log(request.body.sessionId);
    let {
      sessionId,
      result,
      originalRequest
    } = request.body;

    console.log(`Unknown: ${result.action.toLowerCase()}`);

    let user = originalRequest ? originalRequest.data.user.userId : "testuser";
    let device = "";

    // Fill in params
    let params = [];
    const parameters = result.parameters;
    if (parameters) {
      let keys = Object.keys(parameters).sort((a, b) => (a < b) ? -1 : 1);
      keys.forEach((key) => {
        if (key === "Device") {
          if (parameters[key]) {
            device = parameters[key];
          }
        }
        else if (key !== "App") {
          params.push(parameters[key]);
        }
      });
    }
    console.log(params);
    command(user, device.toLowerCase(), appName, sessionId, result.action.toLowerCase(),
      params[0] || "", params[1] || "", params[2] || "",
      params[3] || "", params[4] || "",
      function(status, sessionId, response, parm) {
        switch (status) {
          case 0:
            emitResponse(assistant, response, "ask", parm, "Ok");
            break;
          case 1:
            emitResponse(assistant, response, "ask", parm, `I don't recognize your identity, what is your username?`);
            break;
          default:
            emitResponse(assistant, response, "tell", parm, 'Failed to complete request');
        }

      }.bind(this));
  }
  
  function start(request) {
    let action = request.body.result.action;
    let parms = request.body.result.parameters;
    console.log(`Action: ${action}`);
    console.log(`Parms: ${JSON.stringify(parms)}`);

    const actionMap = new Map();
    actionMap.set('close', close);
    actionMap.set('identify', identify);
    actionMap.set('move', move);
    actionMap.set('launch', launch);
  
    if (action !== "input.welcome" && !actionMap.get(action)) {
      actionMap.set(action, unhandled);
    }
  
    assistant.handleRequest(actionMap);
  }


  if (appName) {
    let params = {
      Bucket: "AlexaApps",
      Key: appName
    };
  
    s3.getObject(params, function(err, data) {
      if (err) {
        console.log(`Error from S3: ${err}`);
        assistant.tell('Application is not available');
        return ;
      }
      
      console.log(data.Body.toString('utf8'));
      var appData = JSON.parse(data.Body.toString('utf8'));
      console.log(appData);

      appName = appData.appName;
      start(request);
      
    });

  }
  else {
    start(request);
  }
};


