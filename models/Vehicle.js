const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    id: {type: String, default: ''}, // SFT-1
    licenseNumber: {type: String, default: ''},
    type: {type: String, default: ''}, // TRUCK, CAR
    truckType: {type: String, default: ''}, // OPEN, BOX, CANOPY
    size: {type: String, default: ''}, // ft size
    weightLimit: {type: Number, default: 0},
    palletCapacity: {type: Number, default: 0},
    logisticsCompany: {type: Schema.Types.ObjectId, ref: 'logisticsCompanies'}
});

module.exports = mongoose.model('vehicles', schema);
