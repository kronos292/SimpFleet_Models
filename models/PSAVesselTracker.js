const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    psaVessel: {type: Schema.Types.ObjectId, ref: 'psaVessels'},
    isEmail: {type: Boolean, default: false},
    isMobile: {type: Boolean, default: false},
    isActive: {type: Boolean, default: true},
    job: {type: Schema.Types.ObjectId, ref: 'jobs'}
});

module.exports = mongoose.model('psaVesselTrackers', schema);