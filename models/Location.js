const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    id: {type: String, default: ''},
    name: {type: String, default: ''},
    lng: {type: Number, default: 0},
    lat: {type: Number, default: 0}
});

module.exports = mongoose.model('locations', schema);
