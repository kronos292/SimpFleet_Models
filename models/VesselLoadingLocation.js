const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    name: {type: String, default: ''},
    type: {type: String, default: ''},
    aliases: [{type: String, default: ''}],
    location: {type: Schema.Types.ObjectId, ref: 'locations'}
});

module.exports = mongoose.model('vesselLoadingLocations', schema);
