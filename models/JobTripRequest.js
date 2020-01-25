const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
    jobTrip: {type: Schema.Types.ObjectId, ref: 'jobTrips'},
    logisticsCompany: {type: Schema.Types.ObjectId, ref: 'logisticsCompanies'},
    status: {type: String, default: 'pending'} // pending, accepted, rejected, cancelled, assigned
});

module.exports = mongoose.model("jobTripRequests", schema);
