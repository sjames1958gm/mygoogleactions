var net = require('net');
var nzappapi =  require('./nzappapi.js');

var transactions = [];
var connected = false;
module.exports.startClient = function() {
  
  console.log(`starting client to ${process.env.MGR_IP}:${process.env.MGR_PORT}`);
  nzappapi.Initialize(
    "./nzappapi.proto", 
    {type: "tcp", constructor: net.Socket, host: process.env.MGR_IP, port: process.env.MGR_PORT},
    {
      AppCommandResp: AppCommandResp
    },
    {
      onOpen: () => (connected = true),
      onClose: () => (connected = false),
      onError: () => (connected = false)
    });

};

module.exports.isConnected = function() {
  return connected;
};

module.exports.command = function(user, app, sessionId, intent, ...rest) {
  let cb;
  if (rest.length > 0 && typeof rest[rest.length - 1] === "function") {
    cb = rest.pop();
  }

  nzappapi.AppCommandReq(user, app, sessionId, intent, 
    rest[0] || "", rest[1] || "", rest[2] || "", rest[3] || "", rest[4] || "");
    
  if (cb) {
    let t = {
      sessionId,
      timer: setInterval(() => cb(-1), 2000),
      f: cb
    };
    transactions.push(t);
  }
};

var AppCommandResp = function(status, sessionId, response, parm) {
  console.log(`AppCommandResp: (${status}, ${sessionId}, ${response}, ${parm})`);
  for (var i = 0; i < transactions.length; i++) {
    let t = transactions[i];
    if (t.sessionId === sessionId) {
       clearInterval(t.timer);
       transactions.splice(i, 1);
       t.f(status, sessionId, response, parm);
       break;
    }
  }
};

