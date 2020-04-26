const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    expoPushNotificationToken: {type: Schema.Types.ObjectId, ref: 'expoPushNotificationTokens'},
    dateTimeSent: {type: Date, default: new Date()},
    dateTimeReceived: {type: Date, default: null},
    dateTimeOpened: {type: Date, default: null},
    status: {type: String, default: ''}, // SENT, RECEIVED, OPENED
});

module.exports = mongoose.model('expoPushNotifications', schema);