const mongoose = require('mongoose');
const {Schema} = mongoose;

const schema = new Schema({
    pickupDateTime: {type: Date, default: null},
    pickupLocation: {type: Schema.Types.ObjectId, ref: 'pickupLocations'},
    pickupStatus : {type: String, default: 'open'},
});

module.exports = mongoose.model('pickupDetails', schema);
