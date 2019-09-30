const mongoose = require('mongoose');
const { Schema } = mongoose;

const jobTrackerSchema = new Schema({
    jobTracker: {type: Schema.Types.ObjectId, ref: 'jobTrackers'},
    fileURL: {type: String, default: ''},
    timeUploaded: {type: Date, default: new Date()},
    version: {type: Number, default: 1},
    remarks: {type: String, default: ''},
    isDeleted: {type: Boolean, default: false}
});

module.exports = mongoose.model('jobTrackerFiles', jobTrackerSchema);
