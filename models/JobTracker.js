const mongoose = require("mongoose");
const { Schema } = mongoose;

const jobTrackerSchema = new Schema({
	index: { type: Number, default: -1 },
	timestamp: { type: Date, default: new Date() },
	trackingType: { type: String, default: "" }, // For icon display.
	title: { type: String, default: "" },
	description: { type: String, default: "" },
	remarks: { type: String, default: "" },
	job: { type: Schema.Types.ObjectId, ref: "jobs" },
	transporterFiles: [{ type: Schema.Types.ObjectId, ref: "transporterFile" }], // Files uploaded during the various stages of the trip.
	userTypes: [{ type: String, default: "" }], // JOB_OWNER, ADMIN, TRANSPORTER
	location: { type: Schema.Types.ObjectId, ref: "locations" }, // Location of this tracker.
	type: { type: String, default: "" }, // START, ONGOING, END
	isCompleted: { type: Boolean, default: false }, // Whether the tracker is completed currently.
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
