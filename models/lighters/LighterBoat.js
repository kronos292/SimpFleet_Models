const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    lighterName: {type: String, default: ''},
    lighterNumber: {type: String, default: ''},
    lighterIMO: {type: String, default: ''},
    lighterBoatCompany: {type: Schema.Types.ObjectId, ref: 'lighterBoatCompanies'},
    status: {type: String, default: ''} // ACTIVE, INACTIVE
});

module.exports = mongoose.model('lighterBoats', schema);