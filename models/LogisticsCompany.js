const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    id: {type: String, default: ""},
    name: {type: String, default: ""},
    location: {type: Schema.Types.ObjectId, ref: 'locations'},
    telegramGroupChatId: {type: String, default: ""},
    correspondenceEmails: [{type: String, default: ""}],
    trucks: [{type: Schema.Types.ObjectId, ref: 'trucks'}],
    productSuites: [{type: Schema.Types.ObjectId, ref: 'productSuites'}],
    logisticsServices: [{type: Schema.Types.ObjectId, default: 'logisticsServices'}] // Services the 3PL is able to provide.
});

module.exports = mongoose.model('logisticsCompanies', schema);
