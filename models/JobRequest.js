const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    job: {type: Schema.Types.ObjectId, ref: "jobs"},
    logisticsCompany: {type: Schema.Types.ObjectId, ref: "logisticsCompanies"},
    notificationStatus: {type: String, default: ''}, // SENT, RECEIVED, OPENED
    status: {type: String, default: ''} // PENDING, ACCEPTED, DECLINED
});

module.exports = mongoose.model('jobRequests', schema);