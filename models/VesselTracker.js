const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    vessel: {type: Schema.Types.ObjectId, ref: 'vessels'},
    emailNotification: {type: Boolean, default: false},
    smsNotification: {type: Boolean, default: false},
    mobileNotification: {type: Boolean, default: false},
    isActive: {type: Boolean, default: true},
    user: {type: Schema.Types.ObjectId, ref: 'users'},
    psaBerthingDateTime: {type: Date, default: null},
    psaUnberthingDateTime: {type: Date, default: null},
    vesselArrivalDateTime: {type: Date, default: null},
    telegramChatId: {type: String, default: ''},
    googleCalendarId: {type: String, default: ''},
    psaBerf: {type: String, default: ""}
});

module.exports = mongoose.model('vesselTrackers', schema);
