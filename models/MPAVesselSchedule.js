const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    duetoArrive: {type: Date, default: null},
    actualArrival: {type: Date, default: null},
    duetoDepart: {type: Date, default: null},
    actualDeparture: {type: Date, default: null}
});

module.exports = mongoose.model('mpaVesselSchedules', schema);