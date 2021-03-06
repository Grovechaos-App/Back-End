var express = require('express');

// Get the router
var router = express.Router();

var Driver = require('./models/driver');
var Ride = require('./models/ride');

var redis = require('redis');
var client = redis.createClient();

// Middleware for all this routers requests
router.use(function timeLog(req, res, next) {
  console.log('Request Received: ', dateDisplayed(Date.now()));
  next();
});

// Welcome message for a GET at http://localhost:8080/GrovechoasRestAPI
router.get('/', function(req, res) {
    res.json({ message: 'Welcome to the REST API' });   
});

// GET all drivers (using a GET at http://localhost:8080/drivers)
router.route('/drivers')
    .get(function(req, res) {
        Driver.find(function(err, drivers) {
            if (err)
                res.send(err);
            res.json(drivers);
        });
        client.flushdb( function (err, succeeded) {
    console.log('succeeded'); // will be true if successfull
});
    });

// Create a driver (using POST at http://localhost:8080/drivers)
router.route('/drivers')
    .post(function(req, res) {
        var driver = new Driver();
        // Set text and user values from the request
	driver.lat = req.body.lat;
	driver.lng = req.body.lng;

        // Save message and check for errors
        driver.save(function(err) {
            if (err)
                res.send(err);
            res.json({ driver: 'Driver created successfully!' });
        });
    });

// Create a ride to MongoDB (using POST at http://localhost:8080/rides)
router.route('/api/rides')
    .post(function(req, res) {
        var ride = new Ride();
        // Set text and user values from the request
	ride.driver = req.body.driver;
    ride.location = { coordinates: req.body.coordinates.split(',').map(Number) };
   	ride.ride = req.body.ride;
        // Save message and check for errors
        ride.save(function(err) {
            if (err)
                res.send(err);
            res.json({ ride: 'Ride created successfully!' });
        });
    });

// GET driver from redis cache, if not found, find from MongoDB and save to redis
router.route('/api/latestDrivers').get(function(req,res){
  client.get('drivers', function (err, drivers) {
    if (drivers) {
    	    console.log('redis baby');
      return res.json({ drivers: JSON.parse(drivers) });
    }

    Driver.find(function(err, drivers) {
    	    console.log('mongo baby');

      if (err) {
        throw err;
      }
      client.set('drivers', JSON.stringify(drivers), 'EX', 10);    
      res.json({ drivers: drivers });
    });
  });
});

// post location of driver to redis using geoadd and seperate sorted set (using POST at http://localhost:8080/postActiveLocation)
router.route('/api/postActiveLocation')
    .post(function(req, res) {
    	var lng = req.body.lng;
    	var lat = req.body.lat;
        var driver = req.body.driver;
        var ride = req.body.ride;
    	var args = [ 'geo:created', Math.floor(new Date() / 1000), driver ];
client.zadd(args, function (err, response) {
    if (err) throw err;
    console.log(args);
    console.log('added '+response+' items.');
});
   client.geoadd('locations', lng, lat, driver, function (err, response) {
    if (err) throw err;
    console.log('added '+response+' geoadds.');
   });
   //client.zadd('geo:created', date / 1000 | 0, driverUID);

   client.zrangebyscore('geo:created', -Infinity, Math.floor(Date.now() / 1000) - 10, function(err, members) {
        // the resulting members would be something like
        // ['userb', '5', 'userc', '3', 'usera', '1']
        // use the following trick to convert to
        // [ [ 'userb', '5' ], [ 'userc', '3' ], [ 'usera', '1' ] ]
        // learned the trick from
        // http://stackoverflow.com/questions/8566667/split-javascript-array-in-chunks-using-underscore-js
    //client.zrem('locations', members)

    console.log(members);
});
        res.json({ ride: 'Ride created successfully!' });
    });

// Get a list of nearbyDrivers (using POST at http://localhost:8080/getActiveDriversInGeoRadius)
router.route('/api/georadius')
    .post(function(req, res) {
    	var lng = req.body.lng;
    	var lat = req.body.lat;

client.georadius('locations', lng, lat, 10000, 'mi', 'WITHDIST', 'WITHCOORD', function(err, nearbyDrivers) {

      res.json({ nearbyDrivers: nearbyDrivers });
    });
});

var Jsonresult = {};
var process = function(lat,lon,dist,unit)
{
    Jsonresult.result = 'success';
    var vehicle_type = new Array('small','medium');  
vehicle_type.forEach(function(vehicle) 
{
    calls.push(function(callback){
        redis.georadius (vehicle,lat,lon ,dist,unit,'WITHCOORD','WITHDIST',  function  ( ERR , Result ) 
        {
            if (ERR) 
            return callback(ERR);  

            Jsonresult[vehicle] = Result;
            callback(null, vehicle);
        });
      });
});

    async.parallel(calls, function(err, result) {
    if (err)
        return console.log(err);
    res.json(Jsonresult);
     });
}

router.route('/api/geotry')
    .post(function(req, res) {

    });

// GET driver with id (using a GET at http://localhost:8080/drivers/:driver_id)
router.route('/drivers/:driver_id')
    .get(function(req, res) {
        Driver.findById(req.params.driver_id, function(err, driver) {
            if (err)
                res.send(err);
            res.json(driver);
        });
    });

// Update driver with id (using a PUT at http://localhost:8080/drivers/:driver_id)
router.route('/drivers/:driver_id')
    .put(function(req, res) {
        Driver.findById(req.params.driver_id, function(err, driver) {
            if (err)
                res.send(err);
            // Update the driver lat and lng
	    driver.lat = req.body.lat;
	    driver.lng = req.body.lng;
            driver.save(function(err) {
                if (err)
                    res.send(err);
                res.json({ driver: 'Driver successfully updated!' });
            });

        });
    });

module.exports = router;

function dateDisplayed(timestamp) {
    var date = new Date(timestamp);
    return (date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());
}