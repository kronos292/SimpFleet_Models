const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    licenseNumber: {type: String, default: ''},
    type: {type: String, default: ''},
    class: {type: String, default: ''},
    weightLimit: {type: Number, default: 0},
    palletCapacity: {type: Number, default: 0}
});

module.exports = mongoose.model('trucks', schema);
