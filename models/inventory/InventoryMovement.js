const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    id: {type: String, default: ''},
    remarks: {type: String, default: ''}, // Reasons for movement
    status: {type: String, default: ''}, // PENDING, STARTED, COMPLETED, CANCELLED
    movementType: {type: String, default: ''}, // INCOMING, OUTGOING, INTERNAL
    inventoryItems: [{type: Schema.Types.ObjectId, ref: 'inventoryItems'}],
    quantityMoved: {type: Number, default: 1},
    dateTimeCreated: {type: Date, default: new Date()},
    estimatedDateTimeStarted: {type: Date, default: new Date()},
    estimatedDateTimeCompleted: {type: Date, default: new Date()},
    actualDateTimeStarted: {type: Date, default: new Date()},
    actualDateTimeCompleted: {type: Date, default: new Date()},
    user: {type: Schema.Types.ObjectId, ref: 'users'}
});

module.exports = mongoose.model('inventoryMovements', schema);