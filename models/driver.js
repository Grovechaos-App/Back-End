var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var driverSchema   = new Schema({
    lat: {
    	type: String,
    	required: true
    },
    lng: {
    	type: String,
    	required: true
    },
    ride: String,
    timestamp: { type : Number, default: Date.now() / 1000 | 0 }

});

module.exports = mongoose.model('drivers', driverSchema);