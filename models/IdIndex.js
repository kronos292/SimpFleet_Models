const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    type: {type: String, default: ''},
    index: {type: Number, default: 1}
});

module.exports = mongoose.model('idIndexes', schema);