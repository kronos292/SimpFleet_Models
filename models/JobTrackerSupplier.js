const mongoose = require("mongoose");
const { Schema } = mongoose;

const jobTrackerSuppliersSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "users" },
    jobTracker: { type: Schema.Types.ObjectId, ref: "jobTrackers" },
    jobTrackerSupplierFiles: [
        { type: Schema.Types.ObjectId, ref: "jobTrackerSupplierFiles" }
    ],
    timeUpdated: { type: Date, default: new Date() }
});

module.exports = mongoose.model(
    "jobTrackerSuppliers",
    jobTrackerSuppliersSchema
);
