const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    name: {type: String, default: ''},
    type: {type: String, default: ''}
});

module.exports = mongoose.model('vesselLoadingLocations', schema);
