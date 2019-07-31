const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentStatusSchema = new Schema({
    index: {type: Number, default: -1},
    timestamp: {type: Date, default: new Date()},
    label: {type: String, default: ''},
    job: {type: Schema.Types.ObjectId, ref: 'jobs'}
});

module.exports = mongoose.model('paymentStatus', paymentStatusSchema);
