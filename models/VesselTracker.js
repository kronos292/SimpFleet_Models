const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    vessel: {type: Schema.Types.ObjectId, ref: 'vessels'},
    isEmail: {type: Boolean, default: false},
    isSMS: {type: Boolean, default: false},
    isMobile: {type: Boolean, default: false},
    isActive: {type: Boolean, default: true},
    job: {type: Schema.Types.ObjectId, ref: 'jobs'}
});

module.exports = mongoose.model('vesselTrackers', schema);