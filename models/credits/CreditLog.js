const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    creditChange: {type: Number, default: 0},
    creditWallet: {type: Schema.Types.ObjectId, ref: 'creditWallets'},
    timestamp: {type: Date, default: new Date()},
    isAdminChange: {type: Boolean, default: false}, // Whether the change was by admin
});

module.exports = mongoose.model('creditLogs', schema);