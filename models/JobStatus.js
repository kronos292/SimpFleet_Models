const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
    index: { type: Number, default: 0 },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    trackingType: { type: String, default: "" },
    isDocumentRequired: { type: Boolean, default: false }
});

module.exports = mongoose.model("jobStatuses", schema);
