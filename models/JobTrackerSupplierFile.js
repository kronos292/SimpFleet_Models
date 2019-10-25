const mongoose = require("mongoose");
const { Schema } = mongoose;

const jobTrackerSupplier = new Schema({
    jobTrackerSupplier: {
        type: Schema.Types.ObjectId,
        ref: "jobTrackerSuppliers"
    },
    user: { type: Schema.Types.ObjectId, ref: "users" },
    fileURL: { type: String, default: "" },
    timeUploaded: { type: Date, default: new Date() },
    version: { type: Number, default: 1 },
    remarks: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
    name: ""
});

module.exports = mongoose.model("jobTrackerSupplierFiles", jobTrackerSupplier);
