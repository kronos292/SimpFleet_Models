const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    id: {type: String, default: ''},
    dateTimeCreated: {type: Date, default: new Date()},
    jobTrip: {type: Schema.Types.ObjectId, ref: 'jobTrips'},
    type: {type: String, default: ''}, // job_charge, 3pl_payment
    invoices: [{type: Schema.Types.ObjectId, ref: 'invoices'}],
    status: {type: String, default: ''} // pending, confirmed, cancelled, paid, refunded
});

module.exports = mongoose.model('transactions', schema);