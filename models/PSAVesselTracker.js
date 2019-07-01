const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    psaBerthingData: {type: Schema.Types.ObjectId, ref: 'psaBerthingData'},
    isEmail: {type: Boolean, default: false},
    isMobile: {type: Boolean, default: false},
    isActive: {type: Boolean, default: true}
});

module.exports = mongoose.model('psaVesselTrackers', schema);