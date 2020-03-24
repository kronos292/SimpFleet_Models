const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    dateTimeUpdated: {type: Date, default: new Date()},
    dateTimeStart: {type: Date, default: new Date()},
    dateTimeEnd: {type: Date, default: new Date()},
    region: {type: String, default: ''}, // SG, US etc.
    areaForecasts: [{type: Schema.Types.ObjectId, ref: 'areaForecasts'}]
});

module.exports = mongoose.model('weatherForecasts', schema);
