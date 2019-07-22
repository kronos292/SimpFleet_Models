const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    price: {type: Number, default: 0},
    uom: {type: String, default: ''}
});

module.exports = mongoose.model('jobOfflandItemPricings', schema);