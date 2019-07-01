const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    psaBerthingData: {type: Schema.Types.ObjectId, ref: 'psaBerthingData'},
    vesselLoadingLocation: {type: String, default: ''},
    psaBerthingDateTime: {type: String, default: ''},
    psaUnberthingDateTime: {type: String, default: ''},
    isEmail: {type: Boolean, default: false},
    isMobile: {type: Boolean, default: false},
    isActive: {type: Boolean, default: true}
});

module.exports = mongoose.model('psaVesselTrackers', schema);