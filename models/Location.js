const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
    id: { type: String, default: "" },
    coords: {
        lng: { type: Number, default: 0 },
        lat: { type: Number, default: 0 },
    },
    name: { type: String, default: "" },
    address: { type: String, default: "" },
    addressLine2: { type: String, default: "" },
    timestamp: {type: Date, default: new Date()},
    type: {type: String, default: ''},
    user: { type: Schema.Types.ObjectId, ref: "users" },
});

module.exports = mongoose.model("locations", schema);
