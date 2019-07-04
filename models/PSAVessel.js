const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    psaVesselID: {type: String, default: ""},
    psaVoyageNumberIn: {type: String, default: ""},
    psaVoyageNumberOut: {type: String, default: ""},
    requiredBerthTime: {type: String, default: ""},
    requiredUnberthTime: {type: String, default: ""},
    estimatedBerthTime: {type: String, default: ""},
    estimatedUnberthTime: {type: String, default: ""},
    actualBerthTime: {type: String, default: ""},
    actualUnberthTime: {type: String, default: ""},
    completionOfDischarge: {type: String, default: ""},
    completionOfLoad: {type: String, default: ""},
    completionOfBunkering: {type: String, default: ""},
    berf: {type: String, default: ""},
    wharfMark: {type: String, default: ""},
    crane: {type: String, default: ""},
    vesselName: {type: String, default: ""},
    vesselCompany: {type: String, default: ""},
    vesselIMO: {type: String, default: ""},
    vesselCallSign: {type: String, default: ""},
    vesselConsortium: {type: String, default: ""},
    vesselConsortiumName: {type: String, default: ""},
    vesselConsortiumMembers: {type: String, default: ""},
    timestamp: {type: Date, default: new Date()}
});

module.exports = mongoose.model('psaVessels', schema);