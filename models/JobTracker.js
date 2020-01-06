const mongoose = require("mongoose");
const { Schema } = mongoose;

const jobTrackerSchema = new Schema({
	index: { type: Number, default: -1 },
	timestamp: { type: Date, default: new Date() },
	trackingType: { type: String, default: "" },
	title: { type: String, default: "" },
	description: { type: String, default: "" },
	remarks: { type: String, default: "" },
	job: { type: Schema.Types.ObjectId, ref: "jobs" },
	isDocumentRequired: { type: Boolean, default: false },
	jobTrackerSuppliers: [
		{
			type: Schema.Types.ObjectId,
			ref: "jobTrackerSuppliers"
		}
	],
	jobTrackerItemCheckLists: {
		type: Schema.Types.ObjectId,
		ref: "jobTrackerItemCheckLists"
	}
});

module.exports = mongoose.model("jobTrackers", jobTrackerSchema);
