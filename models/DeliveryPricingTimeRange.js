const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    startTime: {type: String, default: ''},
    endTime: {type: String, default: ''},
    days: [{type: Number, default: 0}],
    type: {type: String, default: ''}
});

module.exports = mongoose.model('deliveryPricingTimeRanges', schema);