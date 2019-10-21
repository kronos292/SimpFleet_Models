const mongoose = require('mongoose');
const {Schema} = mongoose;

const schema = new Schema({
    pickupDateTime: {type: Date, default: null},
    pickupLocation: {type: Schema.Types.ObjectId, ref: 'pickupLocations'},
});

module.exports = mongoose.model('pickupDetails', schema);
