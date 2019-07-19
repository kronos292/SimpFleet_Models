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
    jobBookingDateTime: {type: Date, default: new Date()},
    vesselArrivalDateTime: {type: Date, default: null},
    remarks: {type: String, default: ''},
    vesselLoadingDateTime: {type: Date, default: null},
    psaBerthingDateTime: {type: Date, default: null},
    psaUnberthingDateTime: {type: Date, default: null},
    googleCalendarId: {type: String, default: ''},
    isCancelled: {type: Boolean, default: false},
    isArchived: {type: Boolean, default: false},
    createDSA: {type: Boolean, default: false}
});

module.exports = mongoose.model('jobs', jobSchema);
