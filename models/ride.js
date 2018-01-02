var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var rideSchema   = new Schema({
	driver: String,
	location: { type: { type: String, default:'Point' }, coordinates: [Number] },
    ride: String,
    timestamp: { type : Date, default: Date.now }
});

module.exports = mongoose.model('rides', rideSchema);