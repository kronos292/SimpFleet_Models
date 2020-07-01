const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    name: {type: String, default: ""},
    location: {type: Schema.Types.ObjectId, ref: 'locations'},
    companyAccountContact: {type: Schema.Types.ObjectId, ref: 'companyAccountContacts'},
    telegramGroupChatId: {type: String, default: ""},
    productSuites: [{type: Schema.Types.ObjectId, ref: 'productSuites'}],
    logisticsCompanies: [{type: Schema.Types.ObjectId, ref: 'logisticsCompanies'}] // Preferred logistics companies assigned to the company.
});

module.exports = mongoose.model('userCompanies', schema);
