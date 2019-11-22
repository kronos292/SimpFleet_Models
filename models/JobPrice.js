const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    job: {type: Schema.Types.ObjectId, ref: 'jobs'},
    price: {type: Number, default: 0},
    type: {type: String, default: ''}
});

module.exports = mongoose.model('jobPrices', schema);