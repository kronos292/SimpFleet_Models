const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    job: {type: Schema.Types.ObjectId, ref: 'jobs'},
    status: {type: String, default: ""}, // Pending, Assigned
    logisticsCompany: {type: Schema.Types.ObjectId, ref: 'logisticsCompanies'},
    expoPushNotifications: [{type: Schema.Types.ObjectId, ref: "expoPushNotifications"}],
    logisticsService: {type: Schema.Types.ObjectId, ref: 'logisticsServices'} // Service the 3PL is providing.
});

module.exports = mongoose.model('jobAssignments', schema);