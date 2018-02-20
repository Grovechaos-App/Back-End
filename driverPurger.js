var express = require('express');

// Get the router
var router = express.Router();

var redis = require('redis');
var client = redis.createClient();

var axios = require('axios');

var Driver = require('./models/driver');
var Ride = require('./models/ride');

function sendEmail() {
   client.zrangebyscore('geo:created', -Infinity, Math.floor(Date.now() / 1000) - 10, function(err, members) {
        // the resulting members would be something like
        // ['userb', '5', 'userc', '3', 'usera', '1']
        // use the following trick to convert to
        // [ [ 'userb', '5' ], [ 'userc', '3' ], [ 'usera', '1' ] ]
        // learned the trick from
        // http://stackoverflow.com/questions/8566667/split-javascript-array-in-chunks-using-underscore-js
            console.log(members);
        if (members.length > 0)  {
            console.log("deleting redis cache for both geo set and sorted set")
            client.zrem('locations', members)
            client.zrem('geo:created', members)
            console.log(members);
        } else {
            console.log("nothing to delete in redis cache")
            console.log(members);
        }
	});
}
setInterval(function() { sendEmail() }, 1*1000);

