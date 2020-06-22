const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    creditAmount: {type: Number, default: 0},
    creditLogs: [{type: Schema.Types.ObjectId, ref: 'creditLogs'}],
    user: {type: Schema.Types.ObjectId, ref: 'users'},
});

module.exports = mongoose.model('creditWallets', schema);