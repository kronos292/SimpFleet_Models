const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    jobTripSequences: [{type: Schema.Types.ObjectId, ref: 'jobTripSequences'}],
    jobs: [{type: Schema.Types.ObjectId, ref: 'jobs'}],
    id: {type: String, default: ''}
});

module.exports = mongoose.model('jobTrips', schema);
