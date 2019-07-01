const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    berthData: {type: JSON, default: {}},
    vesselData: {type: JSON, default: {}},
    psaVesselID: {type: String, default: ""},
    psaVoyageNumberIn: {type: String, default: ""},
    psaVoyageNumberOut: {type: String, default: ""},
    actualBerthTime: {type: String, default: ""},
    timestamp: {type: Date, default: new Date()}
});

module.exports = mongoose.model('psaBerthingData', schema);
