const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    psaVesselID: {type: String, default: ""},
    psaVoyageNumberIn: {type: String, default: ""},
    psaVoyageNumberOut: {type: String, default: ""},
    requiredBerthTime: {type: Date, default: null},
    requiredUnberthTime: {type: Date, default: null},
    estimatedBerthTime: {type: Date, default: null},
    estimatedUnberthTime: {type: Date, default: null},
    actualBerthTime: {type: Date, default: null},
    actualUnberthTime: {type: Date, default: null},
    completionOfDischarge: {type: Date, default: null},
    completionOfLoad: {type: Date, default: null},
    completionOfBunkering: {type: Date, default: null},
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