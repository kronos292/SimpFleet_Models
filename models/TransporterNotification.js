const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: "users" },
	job: { type: Schema.Types.ObjectId, ref: "jobs" },
	callTime: { type: Date, default: new Date() },
	type: { type: String, default: "" },
	isEmail: { type: Boolean, default: false },
	isMobile: { type: Boolean, default: false },
	isActive: { type: Boolean, default: false },
	isNotified: { type: Boolean, default: false },
	timestamp: { type: Date, default: new Date() }
});

module.exports = mongoose.model("transporterNotifications", schema);
