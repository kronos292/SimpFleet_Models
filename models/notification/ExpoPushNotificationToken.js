const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    token: {type: String, default: ''},
    dateTimeAdded: {type: Date, default: new Date()}
});

module.exports = mongoose.model('expoPushNotificationTokens', schema);