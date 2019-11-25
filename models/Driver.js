const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");

const { Schema } = mongoose;

const schema = new Schema({
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  userName: { type: String, default: "", unique: true },
  email: { type: String, default: "", unique: true },
  password: { type: String, default: "" },
  companyName: { type: String, default: "" },
  contactNumber: { type: String, default: "" },
  userType: { type: String, default: "" },
  isApproved: { type: Boolean, default: false },
  token: { type: String, default: "" },
  registerDate: { type: Date, default: new Date() },
  resetPasswordToken: { type: String, default: "" },
  resetPasswordExpiry: { type: String, default: "" }
});

// generating a hash
schema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
schema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model("drivers", schema);
