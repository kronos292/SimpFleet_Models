const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    lng: {type: Number, default: 0},
    lat: {type: Number, default: 0},
    user: {type: Schema.Types.ObjectId, ref: 'transportUsers'},
    timestamp: {type: Date, default: new Date()}
});

module.exports = mongoose.model('transporterGPSLocations', schema);