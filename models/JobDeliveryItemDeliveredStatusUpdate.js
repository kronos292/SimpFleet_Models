const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'users'},
    job: {type: Schema.Types.ObjectId, ref: 'jobs'},
    verificationUploads: [{type: Schema.Types.ObjectId, ref: 'logJobFiles'}],
    timeUpdated: {type: Date, default: new Date()}
});

module.exports = mongoose.model('jobDeliveryItemDeliveredStatusUpdates', schema);