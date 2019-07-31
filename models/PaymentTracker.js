const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentTrackerSchema = new Schema({
    index: {type: Number, default: -1},
    timestamp: {type: Date, default: new Date()},
    label: {type: String, default: ''},
    job: {type: Schema.Types.ObjectId, ref: 'jobs'},
    user: {type: Schema.Types.ObjectId, ref: 'users'},
});

module.exports = mongoose.model('paymentTrackers', paymentTrackerSchema);
