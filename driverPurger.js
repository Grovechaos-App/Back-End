var express = require('express');

// Get the router
var router = express.Router();

var redis = require('redis');
var client = redis.createClient();

var axios = require('axios');

var Driver = require('./models/driver');
var Ride = require('./models/ride');

function sendEmail() {
   email.send(to, headers, body);

   client.zrangebyscore('geo:created', 0, 1000000000000, function(err, members) {
        // the resulting members would be something like
        // ['userb', '5', 'userc', '3', 'usera', '1']
        // use the following trick to convert to
        // [ [ 'userb', '5' ], [ 'userc', '3' ], [ 'usera', '1' ] ]
        // learned the trick from
        // http://stackoverflow.com/questions/8566667/split-javascript-array-in-chunks-using-underscore-js
        client.zrem('locations', members)
        
    console.log(members);
});
}
setInterval(sendEmail, 10*1000);

