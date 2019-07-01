const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    job: {type: Schema.Types.ObjectId, ref: 'jobs'},
    quantity: {type: Number, default: 1},
    uom: {type: String, default: ''}
});

module.exports = mongoose.model('jobOfflandItems', schema);