const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
	jobTrackerId: { type: Schema.Types.ObjectId, ref: "jobTrackers" },
	isItemsPickUpOrDelivered: { type: Boolean, default: false },
	isDocumentCollected: { type: Boolean, default: false },
	isReturnItemsRequired: { type: Boolean, default: false },
	returnItemDetails: { type: String, default: "" }
});

module.exports = mongoose.model("jobTrackerItemCheckLists", schema);
