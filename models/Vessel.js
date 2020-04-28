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
    vesselLength: {type: String, default: ""},
    vesselBreadth: {type: String, default: ""},
    vesselDepth: {type: String, default: ""},
    vesselType: {type: String, default: ""},
    vesselGrossTonnage: {type: String, default: ""},
    vesselNetTonnage: {type: String, default: ""},
    vesselDeadWeight: {type: String, default: ""},
    vesselMMSINumber: {type: String, default: ""},
    vesselYearBuilt: {type: String, default: ""},
    vesselIsmManager: {type: String, default: ""},
    vesselShipManager: {type: String, default: ""},
    vesselRegisteredOwnership: {type: String, default: ""},
    vesselClassificationSociety: {type: String, default: ""},
});

module.exports = mongoose.model('vessels', vesselSchema);
