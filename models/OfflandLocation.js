const mongoose = require('mongoose');
const {Schema} = mongoose;

const schema = new Schema({
    addressString: {type: String, default: ''},
    location: {type: Schema.Types.ObjectId, ref: 'locations'},
    user: {type: Schema.Types.ObjectId, ref: 'users'}
});

module.exports = mongoose.model('offlandLocations', schema);
