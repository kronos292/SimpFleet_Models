const mongoose = require('mongoose');
const { Schema } = mongoose;

const vesselSchema = new Schema({
    vesselIMOID: {type: String, default: ""},
    vesselName: {type: String, default: ""},
    vesselCallsign: {type: String, default: ""}
});

module.exports = mongoose.model('vessels', vesselSchema);
