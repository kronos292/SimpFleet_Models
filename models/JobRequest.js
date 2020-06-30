const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    job: {type: Schema.Types.ObjectId, ref: "jobs"},
    logisticsCompany: {type: Schema.Types.ObjectId, ref: "logisticsCompanies"},
    expoPushNotifications: [{type: Schema.Types.ObjectId, ref: "expoPushNotifications"}],
    status: {type: String, default: ''}, // PENDING, ACCEPTED, DECLINED, PASSED, ASSIGNED
    declineRemarks: {type: String, default: ''}, // Reason for declining job request.
    logisticsServices: [{type: Schema.Types.ObjectId, ref: "logisticsServices"}] // The types of logistics services this job request is seeking.
});

module.exports = mongoose.model('jobRequests', schema);