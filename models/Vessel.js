const mongoose = require('mongoose');
const { Schema } = mongoose;

const vesselSchema = new Schema({
    psaVessels: [{type: Schema.Types.ObjectId, ref: 'psaVessels'}],
    psaVessel: {type: Schema.Types.ObjectId, ref: 'psaVessels'}, // Latest PSA Vessel
    mpaVessel: {type: Schema.Types.ObjectId, ref: 'mpaVessels'},
    marineTrafficVessel: {type: Schema.Types.ObjectId, ref: 'marineTrafficVessels'},
    psaQuayCraneSequence: {type: Schema.Types.ObjectId, ref: 'psaQuayCraneSequences'},  // Latest PSA QC Sequence

    // Vessel details from MPA sources
    vesselIMOID: {type: String, default: ""},
    vesselName: {type: String, default: ""},
    vesselCallsign: {type: String, default: ""},
    vesselFlag: {type: String, default: ""},
    vesselLength: {type: Number, default: 0},
    vesselBreadth: {type: Number, default: 0},
    vesselDepth: {type: Number, default: 0},
    vesselType: {type: String, default: ""},
    vesselGrossTonnage: {type: Number, default: 0},
    vesselNetTonnage: {type: Number, default: 0},
    vesselDeadWeight: {type: Number, default: 0},
    vesselMMSINumber: {type: String, default: ""},
    vesselYearBuilt: {type: String, default: ""},
    vesselIsmManager: {type: String, default: ""},
    vesselShipManager: {type: String, default: ""},
    vesselRegisteredOwnership: {type: String, default: ""},
    vesselClassificationSociety: {type: String, default: ""},
});

module.exports = mongoose.model('vessels', vesselSchema);
