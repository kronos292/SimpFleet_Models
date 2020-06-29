const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    name: {type: String, default: ""},
    type: {type: String, default: ""}, // TYPE_TRUCK, TYPE_BOAT
});

module.exports = mongoose.model('logisticsServices', schema);
