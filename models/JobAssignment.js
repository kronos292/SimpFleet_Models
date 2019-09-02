const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    job: {type: Schema.Types.ObjectId, ref: 'jobs'},
    status: {type: String, default: ""},
    logisticsCompany: {type: Schema.Types.ObjectId, ref: 'logisticsCompanies'}
});

module.exports = mongoose.model('jobAssignments', schema);