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

const presentations = require('./presentations');
const telegram = require('./telegram');
const nzos = require('./nzos');

app.post('/presentations',  function (request, response) {
    presentations(request, response, checkConnection);
});

app.post('/telegram', function (request, response) {
    telegram(request, response, checkConnection);
});

app.post('/nzos', function (request, response) {
    nzos(request, response, checkConnection);
});

let server = app.listen(process.env.PORT || 8080, function () {
    let port = server.address().port;
    console.log('App listening on port %s', port);
});