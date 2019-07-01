const mongoose = require('mongoose');
const { Schema } = mongoose;

const jobSchema = new Schema({
    jobId: {type: String, default: ''},
    vessel: {type: Schema.Types.ObjectId, ref: 'vessels'},
    jobTrackers: [{type: Schema.Types.ObjectId, ref: 'jobTrackers'}],
    vesselLoadingLocation: {type: String, default: ''},
    user: {type: Schema.Types.ObjectId, ref: 'users'},
    index: {type: String, default: ''},
    jobItems: [{type: Schema.Types.ObjectId, ref: 'jobItems'}],
    jobOfflandItems: [{type: Schema.Types.ObjectId, ref: 'jobOfflandItems'}],
    careOffParties: [{type: Schema.Types.ObjectId, ref: 'careOffParties'}],
    jobBookingDateTime: {type: String, default: new Date().toString()},
    vesselArrivalDateTime: {type: String, default: ''},
    remarks: {type: String, default: ''},
    vesselLoadingDateTime: {type: String, default: ''},
    psaBerthingDateTime: {type: String, default: ''},
    psaUnberthingDateTime: {type: String, default: ''},
    googleCalendarId: {type: String, default: ''},
    isCancelled: {type: Boolean, default: false}
});

module.exports = mongoose.model('jobs', jobSchema);
