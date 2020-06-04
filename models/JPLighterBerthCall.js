const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    lighterName: {type: String, default: ''},
    lighterNumber: {type: String, default: ''},
    companyName: {type: String, default: ''},
    crane: {type: String, default: ''},
    arrivalDateTime: {type: Date, default: null},
    departureDateTime: {type: Date, default: null},
    terminal: {type: String, default: ''},
    lighterBoat: {type: Schema.Types.ObjectId, ref: 'lighterBoats'}
});

module.exports = mongoose.model('jpLighterBerthCalls', schema);