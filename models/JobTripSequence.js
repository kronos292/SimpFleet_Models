const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    driver: {type: Schema.Types.ObjectId, ref: 'drivers'},
    truck: {type: Schema.Types.ObjectId, ref: 'trucks'},
    origin: {type: Schema.Types.ObjectId, ref: 'locations'},
    destination: {type: Schema.Types.ObjectId, ref: 'locations'},
    job: {type: Schema.Types.ObjectId, ref: 'jobs'},
    tripItems: [{type: Schema.Types.ObjectId, ref: 'tripItems'}],
    predictedStartDateTime: {type: Date, default: null},
    predictedEndDateTime: {type: Date, default: null},
    actualStartDateTime: {type: Date, default: null},
    actualEndDateTime: {type: Date, default: null},
    type: {type: String, default: ''},
    seqNumber: {type: Number, default: 0}
});

module.exports = mongoose.model('jobTripSequences', schema);
