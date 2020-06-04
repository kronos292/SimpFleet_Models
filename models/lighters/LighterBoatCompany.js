const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    companyName: {type: String, default: ''},
    companyAliases: [{type: String, default: ''}]
});

module.exports = mongoose.model('lighterBoatCompanies', schema);