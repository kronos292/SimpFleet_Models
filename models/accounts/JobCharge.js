const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    id: {type: String, default: ''},
    dateTimeCreated: {type: Date, default: new Date()},
    job: {type: Schema.Types.ObjectId, ref: 'jobs'},
    invoice: {type: Schema.Types.ObjectId, ref: 'invoices'},
    status: {type: String, default: ''}, // Pending, Confirmed, Cancelled, Paid, Refunded
    description: {type: String, default: ''},
    remarks: {type: String, default: ''}
});

module.exports = mongoose.model('jobCharges', schema);