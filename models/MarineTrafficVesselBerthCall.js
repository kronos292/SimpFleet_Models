const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    dockTimestamp: {type: Date, default: null},
    unDockTimestamp: {type: Date, default: null},
    berthId: {type: String, default: ""},
    berthName: {type: String, default: ""},
    terminalId: {type: String, default: ""},
    terminalName: {type: String, default: ""},
    portId: {type: String, default: ""},
    portName: {type: String, default: ""},
    unLocationCode: {type: String, default: ""},
    countryCode: {type: String, default: ""},
    destinationId: {type: String, default: ""},
    destinationName: {type: String, default: ""}
});

module.exports = mongoose.model('marineTrafficVesselBerthCalls', schema);