const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    vesselName: {type: String, default: ""},
    vesselIMO: {type: String, default: ""},
    vesselCallSign: {type: String, default: ""},
    vesselFlag: {type: String, default: ""},
    vesselType: {type: String, default: ""},
    vesselLocations: [{type: Schema.Types.ObjectId, ref: 'mpaVesselLocations'}],
    vesselMovements: [{type: Schema.Types.ObjectId, ref: 'mpaVesselMovements'}],
    mpaVesselSchedules: [{type: Schema.Types.ObjectId, ref: 'mpaVesselSchedules'}]
});

module.exports = mongoose.model('mpaVessels', schema);