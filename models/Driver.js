const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    name: {type: String, default: ''},
    contact: {type: String, default: ''},
    email: {type: String, default: ''}
});

module.exports = mongoose.model('drivers', schema);
