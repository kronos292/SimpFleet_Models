const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    shipId: {type: String, default: ""},
    MMSI: {type: String, default: ""},
    IMO: {type: String, default: ""},
    vesselName: {type: String, default: ""},
    typeName: {type: String, default: ""},
    deadWeightTonnage: {type: String, default: ""},
    grossRegisterTonnage: {type: String, default: ""},
    flag: {type: String, default: ""},
    yearBuilt: {type: String, default: ""},
    marineTrafficVesselBerthCalls: [{type: Schema.Types.ObjectId, ref: 'marineTrafficVesselBerthCalls'}]
});

module.exports = mongoose.model('marineTrafficVessels', schema);