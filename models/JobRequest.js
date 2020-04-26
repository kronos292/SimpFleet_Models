const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    job: {type: Schema.Types.ObjectId, ref: "jobs"},
    logisticsCompany: {type: Schema.Types.ObjectId, ref: "logisticsCompanies"},
    expoPushNotifications: [{type: Schema.Types.ObjectId, ref: "expoPushNotification"}],
    status: {type: String, default: ''}, // PENDING, ACCEPTED, DECLINED, PASSED, ASSIGNED
    declineRemarks: {type: String, default: ''} // Reason for declining job request.
});

module.exports = mongoose.model('jobRequests', schema);