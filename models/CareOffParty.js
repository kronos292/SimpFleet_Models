const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    job: {type: Schema.Types.ObjectId, ref: 'jobs'},
    companyName: {type: String, default: ''},
    personName: {type: String, default: ''},
    contactNumber: {type: String, default: ''},
    email: {type: String, default: ''},
    user: {type: Schema.Types.ObjectId, ref: 'users'},
    jobItems: [{type: Schema.Types.ObjectId, ref: 'jobItems'}],
    jobOfflandItems: [{type: Schema.Types.ObjectId, ref: 'jobOfflandItems'}]
});

module.exports = mongoose.model('careOffParties', schema);