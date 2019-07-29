const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    quantity: {type: Number, default: 1},
    uom: {type: String, default: ''}
});

module.exports = mongoose.model('tripItems', schema);