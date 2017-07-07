process.env.DEBUG = 'actions-on-google:*';

let express = require('express');
let bodyParser = require('body-parser');

let app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({type: 'application/json'}));

require('dotenv').config();

const { startClient, isConnected } = require('./managerIf');

startClient();

function checkConnection(assistant) {
    if (!isConnected()) {
        assistant.tell("No connection to application manager");
        return false;
    }
    return true;
}

const nzos = require('./nzos');

// app.post('/presentations',  function (request, response) {
//     nzos(request, response, checkConnection, "presentations");
// });

// app.post('/telegram', function (request, response) {
//     nzos(request, response, checkConnection, "telegram");
// });

app.post('/nzos', function (request, response) {
    nzos(request, response, checkConnection);
});

app.post('/:app', function (request, response) {
    // console.log(request);
    nzos(request, response, checkConnection, request.params.app);
});

// app.post('/video', function (request, response) {
//     nzos(request, response, checkConnection, "video");
// });

let server = app.listen(process.env.PORT || 8080, function () {
    let port = server.address().port;
    console.log('App listening on port %s', port);
});