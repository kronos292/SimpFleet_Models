const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    itemCode: {type: String, default: ''},
    itemName: {type: String, default: ''},
    description: {type: String, default: ''},
    inventoryItemUOM: {type: Schema.Types.ObjectId, ref: 'inventoryItemUOMs'},
    quantity: {type: Number, default: 1},
    userCompany: {type: Schema.Types.ObjectId, ref: 'userCompanies'},
});

module.exports = mongoose.model('inventoryItems', schema);