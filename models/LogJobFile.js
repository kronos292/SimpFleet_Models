const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    job: {type: Schema.Types.ObjectId, ref: 'jobs'},
    user: {type: Schema.Types.ObjectId, ref: 'users'},
    fileURL: {type: String, default: ''},
    timeUploaded: {type: Date, default: new Date()},
    version: {type: Number, default: 1},
    type: {type: String, default: ''},
    remarks: {type: String, default: ''},
    isDeleted: {type: Boolean, default: false}
});

module.exports = mongoose.model('logJobFiles', schema);