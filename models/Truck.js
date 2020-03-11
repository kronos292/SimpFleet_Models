const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    id: {type: String, default: ''}, // SFT-1
    licenseNumber: {type: String, default: ''},
    type: {type: String, default: ''}, // OPEN, BOX, CANOPY
    size: {type: String, default: ''}, // ft size
    class: {type: String, default: ''},
    weightLimit: {type: Number, default: 0},
    palletCapacity: {type: Number, default: 0},
    logisticsCompany: {type: Schema.Types.ObjectId, ref: 'logisticsCompanies'}
});

module.exports = mongoose.model('trucks', schema);
