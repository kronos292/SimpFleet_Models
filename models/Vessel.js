const mongoose = require('mongoose');
const { Schema } = mongoose;

const vesselSchema = new Schema({
    psaVessel: {type: Schema.Types.ObjectId, ref: 'psaVessels'},
    mpaVessel: {type: Schema.Types.ObjectId, ref: 'mpaVessels'},
    vesselIMOID: {type: String, default: ""},
    vesselName: {type: String, default: ""},
    vesselCallsign: {type: String, default: ""}
});

module.exports = mongoose.model('vessels', vesselSchema);
