const mongoose = require('mongoose');
const {Schema} = mongoose;

const schema = new Schema({
    jobTripSequences: [{type: Schema.Types.ObjectId, ref: 'jobTripSequences'}],
    jobs: [{type: Schema.Types.ObjectId, ref: 'jobs'}],
    leaveWarehouse: {type: Date, default: null},
    endWork: {type: Date, default: null},
    driver: {type: Schema.Types.ObjectId, ref: 'drivers'},
    id: {type: String, default: ''}
});

module.exports = mongoose.model('jobTrips', schema);
