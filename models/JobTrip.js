const mongoose = require("mongoose");
const {Schema} = mongoose;

const schema = new Schema({
    jobTripSequences: [{type: Schema.Types.ObjectId, ref: "jobTripSequences"}],
    jobs: [{type: Schema.Types.ObjectId, ref: "jobs"}],
    startTrip: {type: Date, default: null},
    endTrip: {type: Date, default: null},
    driver: {type: Schema.Types.ObjectId, ref: "transportUsers"},
    id: {type: String, default: ""},
    jobTripCreationDateTime: {type: Date, default: new Date()},
    vehicles: {type: Schema.Types.ObjectId, ref: 'vehicles'},
    estimatedJobCostingBreakdowns: [{type: Schema.Types.ObjectId, ref: 'jobCostingBreakdowns'}],
    actualJobCostingBreakdowns: [{type: Schema.Types.ObjectId, ref: 'jobCostingBreakdowns'}]
});

module.exports = mongoose.model("jobTrips", schema);
