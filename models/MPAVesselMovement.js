const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    movementStartDateTime: {type: Date, default: null},
    movementEndDateTime: {type: Date, default: null},
    movementStatus: {type: String, default: ""},
    movementType: {type: String, default: ""},
    locationFrom: {type: String, default: ""},
    locationTo: {type: String, default: ""},
    movementDraft: {type: String, default: ""},
    movementHeight: {type: String, default: ""}
});

module.exports = mongoose.model('mpaVesselMovements', schema);