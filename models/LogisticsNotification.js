const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'logisticsUsers'},
    job: {type: Schema.Types.ObjectId, ref: 'jobs'},
    alertTime: {type: Date, default: new Date()},
    message: {type: String, default: ''},
    header: {type: String, default: ''},
    type: {type: String, default: ''},
    isApp: {type: Boolean, default: false},
    isEmail: {type: Boolean, default: false},
    isMobile: {type: Boolean, default: false},
    isActive: {type: Boolean, default: true}
});

module.exports = mongoose.model('logisticsNotifications', schema);