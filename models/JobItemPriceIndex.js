const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    index:{type: String, default: ''},
    price: {type: Number, default: 0},
});

module.exports = mongoose.model('jobItemPriceIndexes', schema);