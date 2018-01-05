var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000;
bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Setup the routes that the server will listen on from the StudentsRoutes file.
var routes = require('./api/routes/StudentsRoutes.js');
routes(app);

//Start the server and enable it to listen for incoming connections/requests on the port specified.
app.listen(port);

console.log('Students RESTful API server started on: ' + port);