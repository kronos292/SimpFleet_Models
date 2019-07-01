const mongoose = require('mongoose');
const { Schema } = mongoose;

const jobFileSchema = new Schema({
    job: {type: Schema.Types.ObjectId, ref: 'jobs'},
    user: {type: Schema.Types.ObjectId, ref: 'users'},
    fileURL: {type: String, default: ''},
    timeUploaded: {type: String, default: new Date().toString()},
    version: {type: Number, default: 1},
    type: {type: String, default: ''},
    filename: {type: String, default: ''},
    numCopies: {type: Number, default: 1},
    requirements: [{type: Schema.Types.Mixed}],
    remarks: {type: String, default: ''},
    isDeleted: {type: Boolean, default: false}
});

module.exports = mongoose.model('jobFiles', jobFileSchema);