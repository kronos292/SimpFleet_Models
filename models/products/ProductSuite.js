const mongoose = require('mongoose');
const { Schema } = mongoose;

// Determines the type of products users of a company can access.
const schema = new Schema({
    name: {type: String, default: ''},
    type: {type: String, default: ''},
});

module.exports = mongoose.model('productSuites', schema);