const mongoose = require('mongoose');
const {Schema} = mongoose;

const schema = new Schema({
    vesselLoadingLocation: {type: Schema.Types.ObjectId, ref: 'vesselLoadingLocations'},
    otherVesselLoadingLocation: {type: String, default: ''},
    vesselLoadingDateTime: {type: Date, default: null},
});

module.exports = mongoose.model('loadingDetails', schema);
