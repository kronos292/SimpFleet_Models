const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    terminal: {type: String, default: ''},
    berth: {type: String, default: ''},
    location: {type: Schema.Types.ObjectId, ref: 'locations'}
});

module.exports = mongoose.model('psaBerths', schema);
