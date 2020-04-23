const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    fileURL: {type: String, default: ''},
    status: {type: String, default: 'Pending'}, // Pending, Validated, Rejected
    jobPayment: {type: Schema.Types.ObjectId, ref: 'jobPayments'},
    textractJobId: {type: String, default: ''}
});

module.exports = mongoose.model('paymentInvoiceUploads', schema);