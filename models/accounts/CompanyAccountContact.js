const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    userCompany: {type: Schema.Types.ObjectId, ref: 'userCompanies'},
    emails: [{type: String, default: ""}],
    xeroContactGroupId: {type: String, default: ""}
});

module.exports = mongoose.model('companyAccountContacts', schema);
