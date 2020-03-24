const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    weatherAreaMapping: {type: Schema.Types.ObjectId, ref: 'weatherAreaMappings'},
    forecastType: {type: Schema.Types.ObjectId, ref: 'forecastTypes'},
    weatherForecast: {type: Schema.Types.ObjectId, ref: 'weatherForecasts'}
});

module.exports = mongoose.model('areaForecasts', schema);
