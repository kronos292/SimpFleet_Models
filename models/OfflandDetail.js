const mongoose = require('mongoose');
const {Schema} = mongoose;

const schema = new Schema({
    offlandDateTime: {type: Date, default: null},
    offlandLocation: {type: Schema.Types.ObjectId, ref: 'offlandLocations'},
    offlandStatus : {type: String, default: 'open'},
});

module.exports = mongoose.model('offlandDetails', schema);
