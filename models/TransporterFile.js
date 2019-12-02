const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "transportUsers"
  },
  fileURL: {
    type: String,
    default: ""
  },
  filename: {
    type: String,
    default: ""
  },
  fileFor: {
    type: String,
    default: ""
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  timeUploaded: {
    type: Date,
    default: new Date()
  }
});

module.exports = mongoose.model("transporterFile", schema);
