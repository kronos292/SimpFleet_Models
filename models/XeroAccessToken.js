const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    dateTimeCreated: {type: Date, default: new Date()},
    accessToken: {type: Schema.Types.Mixed, default: {}}
});

module.exports = mongoose.model('xeroAccessTokens', schema);