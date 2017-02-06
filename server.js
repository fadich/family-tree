console.log(new Date());
console.info('Running server. . .');

/**********************************************************************************************************************/

var express = require('express');
var app = express();

var person = require('./models/person');
var tree   = require('./models/tree');

/**
 * @param message     The message information about an action result.
 *                    Can be accompanied by a key like: success; info; notice; error.
 * @param data        Data to be transferred to client.
 * @returns {{message: ({}), data: ({})}}
 */
var send = function (message, data) {
    return {
        message: message || {},
        data:    data    || {}
    }
};


app.use(express.static(__dirname + '/www'));

app.get('/', function (req, res) {
    res.render('www/index');
    res.send();
})

app.post('/get-tree', function(req, res) {

    res.type = "application/json";

    var dTree = tree.getTree();
    // processing the received data
    var data = dTree === false ? {} : {tree: dTree};
    var msg  = dTree === false ? {error: "Failed getting tree"} : null;

    res.send(send(msg, data));
});

app.post('/person/:id', function(req, res) {

    res.type = "application/json";

    res.send(send(
        null,
        {person: person.get(req.params.id)}
    ));
});

app.post('/person/create', function(req, res) {

    res.type = "application/json";

    var person = person.get().setAttributes(req);
    if (person.save()) {

        // TODO: do not forget about photo!

        res.send(send({success: "Node successfully created"}));
        res.end();
    }

    res.statusCode = 400;
    res.send(send(
        {warning: "Node cannot be created. Maybe, data is invalid. Check it for the correctness and try again"},
        {error: person.getErrors()}
    ));
});

app.post('/person/:id/update', function(req, res) {

    res.type = "application/json";

    var person = person.get(req.id).setAttributes(req);
    if (person.save()) {
        res.send(send({success: "Node successfully updated"}));
        res.end();
    }

    res.statusCode = 400;
    res.send(send(
        {warning: "Node cannot be updated. Maybe, data is invalid. Check it for the correctness and try again"},
        {error: person.getErrors()}
    ));
});

app.delete('/person/:id/delete', function(req, res) {

    res.type = "application/json";

    var person = person.get(req.id);
    if (person.delete()) {
        res.send(send({success: "Node (branch) successfully deleted"}));
        res.end();
    }

    res.statusCode = 400;
    res.send(send(
        {warning: "Node cannot be updated. Maybe, data is invalid. Check it for the correctness and try again"},
        {error: person.getErrors()}
    ));
});


app.all('*', function(req, res) {
    res.statusCode = 404;
    res.send("Incorrect request. Page not found");
});

app.listen("4242");
