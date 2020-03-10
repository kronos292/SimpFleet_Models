const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    dateTimeCreated: {type: Date, default: new Date()},
    dateTimeIssued: {type: Date, default: new Date()},
    dateTimeDue: {type: Date, default: new Date()},
    dateTimePaid: {type: Date, default: new Date()},
    type: {type: String, default: ''}, // receivable, payable
    xeroId: {type: String, default: ''},
    xeroNumber: {type: String, default: ''},
    xeroContactId: {type: String, default: ''},
    jobCharge: {type: Schema.Types.ObjectId, ref: 'jobCharges'},
    jobPayment: {type: Schema.Types.ObjectId, ref: 'jobPayments'},
    fileURL: {type: String, default: ''},
    status: {type: String, default: 'Draft'} // Draft, Submitted, Authorised, Paid
});

module.exports = mongoose.model('invoices', schema);
