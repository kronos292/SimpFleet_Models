const mongoose = require('mongoose');
const { Schema } = mongoose;

const vesselSchema = new Schema({
    psaVessels: [{type: Schema.Types.ObjectId, ref: 'psaVessels'}],
    psaVessel: {type: Schema.Types.ObjectId, ref: 'psaVessels'}, // Latest PSA Vessel
    mpaVessel: {type: Schema.Types.ObjectId, ref: 'mpaVessels'},
    marineTrafficVessel: {type: Schema.Types.ObjectId, ref: 'marineTrafficVessels'},
    psaQuayCraneSequence: {type: Schema.Types.ObjectId, ref: 'psaQuayCraneSequences'},  // Latest PSA QC Sequence
    vesselIMOID: {type: String, default: ""},
    vesselName: {type: String, default: ""},
    vesselCallsign: {type: String, default: ""}
});

module.exports = mongoose.model('vessels', vesselSchema);
