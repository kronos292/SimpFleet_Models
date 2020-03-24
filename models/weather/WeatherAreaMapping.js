const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    name: {type: String, default: ''},
    latitude: {type: Number, default: 0},
    longitude: {type: Number, default: 0}
});

module.exports = mongoose.model('weatherAreaMappings', schema);
