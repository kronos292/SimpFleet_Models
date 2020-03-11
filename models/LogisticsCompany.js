const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    id: {type: String, default: ""},
    name: {type: String, default: ""},
    location: {type: Schema.Types.ObjectId, ref: 'locations'},
    telegramGroupChatId: {type: String, default: ""},
    correspondenceEmails: [{type: String, default: ""}]
});

module.exports = mongoose.model('logisticsCompanies', schema);
