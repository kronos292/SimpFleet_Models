const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    name: {type: String, default: ''},
    description: {type: String, default: ''},
    price: {type: Number, default: 0},
    type: {type: String, default: ''}, // Estimated, Actual
    job: {type: Schema.Types.ObjectId, ref: "jobs"}
});

module.exports = mongoose.model('jobPricingBreakdowns', schema);