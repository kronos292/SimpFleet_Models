const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'transportUsers'},
    jobTrip: {type: Schema.Types.ObjectId, ref: 'jobTrips'},
    startDateTime: {type: Date, default: new Date()},
    endDateTime: {type: Date, default: null},
    telegramMessageId: {type: String, default: ''}
});

module.exports = mongoose.model('transporterGPSTrackings', schema);