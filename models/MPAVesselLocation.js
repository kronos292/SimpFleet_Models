const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    vessel: {type: Schema.Types.ObjectId, ref: 'mpaVessels'},
    latitude: {type: String, default: ""},
    longitude: {type: String, default: ""},
    latitudeDegrees: {type: String, default: ""},
    longitudeDegrees: {type: String, default: ""},
    speed: {type: String, default: ""},
    course: {type: String, default: ""},
    heading: {type: String, default: ""},
    locationTimestamp: {type: Date, default: null},
});

module.exports = mongoose.model('mpaVesselLocations', schema);