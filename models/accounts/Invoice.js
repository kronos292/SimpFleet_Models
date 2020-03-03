const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    dateTimeCreated: {type: Date, default: new Date()},
    type: {type: String, default: ''}, // receivable, payable
    xeroId: {type: String, default: ''},
    xeroNumber: {type: String, default: ''},
});

module.exports = mongoose.model('invoices', schema);