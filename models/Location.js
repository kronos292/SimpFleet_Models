const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
    id: { type: String, default: "" },
    name: { type: String, default: "" },
    coords: {
        lng: { type: Number, default: 0 },
        lat: { type: Number, default: 0 },
    },
    companyDetails: { type: String, default: "" },
    buildingDetails: { type: String, default: "" },
    user: { type: Schema.Types.ObjectId, ref: "users" },
});

module.exports = mongoose.model("locations", schema);
