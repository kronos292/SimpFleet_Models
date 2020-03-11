const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    id: {type: String, default: ''},
    name: {type: String, default: ''},
    description: {type: String, default: ''},
    price: {type: Number, default: 0},
    type: {type: String, default: ''}, // Estimated, Actual
    job: {type: Schema.Types.ObjectId, ref: "jobs"},
    dateTimeCreated: {type: Date, default: new Date()}, // Date and time created
    dateTimeUpdated: {type: Date, default: new Date()}, // Date and time updated
    isDeleted: {type: Boolean, default: false}
});

module.exports = mongoose.model('jobPricingBreakdowns', schema);