const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  job: {type: Schema.Types.ObjectId, ref: 'jobs'},
  logisticsUser: {type: Schema.Types.ObjectId, ref: 'logisticsUsers'}, // Null if Transport user uploads the file
  transportUser: {type: Schema.Types.ObjectId, ref: 'users'}, // Null if Logistics user uploads the file
  fileURL: {type: String, default: ''},
  timeUploaded: {type: Date, default: new Date()},
  version: {type: Number, default: 1},
  type: {type: String, default: ''},
  filename: {type: String, default: ''},
  numCopies: {type: Number, default: 1},
  requirements: [{type: Schema.Types.Mixed}],
  remarks: {type: String, default: ''},
  isDeleted: {type: Boolean, default: false}
});

module.exports = mongoose.model("transporterFile", schema);
