const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    driver: {type: Schema.Types.ObjectId, ref: 'drivers'},
    truck: {type: Schema.Types.ObjectId, ref: 'trucks'},
    origin: {type: Schema.Types.ObjectId, ref: 'locations'},
    destination: {type: Schema.Types.ObjectId, ref: 'locations'}
});

module.exports = mongoose.model('driverJobs', schema);
