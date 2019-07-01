const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    job: {type: Schema.Types.ObjectId, ref: 'jobs'},
    users: [{type: Schema.Types.ObjectId, ref: 'users'}],
    url: {type: String, default: ''},
    isEnabled: {type: Boolean, default: true}
});

module.exports = mongoose.model('jobLinks', schema);