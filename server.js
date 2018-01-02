// Create an HTTP server by loading http module
var http = require('http');
 
// Configure the HTTP server to respond identically to any request
var server = http.createServer(function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end("Hello From Your HTTP Server\n");
});
 
// Listen on port 3000, IP defaults to 127.0.0.1
server.listen(3000);
 
// Put a friendly message on the terminal
console.log("HTTP Server running at http://127.0.0.1:3000/");

var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var routes     = require('./routes');

var redis = require('redis');
var client = redis.createClient();

client.on('connect', function() {
    console.log('connected');
});
 
var mongoose = require("mongoose");

var uri = 'mongodb://alexyesiam:alexbui1@cluster0-shard-00-00-3qvov.mongodb.net:27017,cluster0-shard-00-01-3qvov.mongodb.net:27017,cluster0-shard-00-02-3qvov.mongodb.net:27017/grovechaos?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin';

mongoose.connect(uri);
 
// Express app will use body-parser to get data from POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
 
// Set port
var port = process.env.PORT || 8080;        // set the port
 
// Define a prefix for all routes
// Can define something unique like MyRestAPI
// We'll just leave it so all routes are relative to '/'
app.use('/', routes);
 
// Start server listening on port 8080
app.listen(port);
