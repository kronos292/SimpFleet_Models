const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");
const { Schema } = mongoose;

const schema = new Schema({
  username: {
    type: String,
    trim: true,
    required: true,

    default: ""
  },
  phonenumber: {
    type: String,
    default: "",
    trim: true,
    required: true
  },
  email: {
    type: String,
    unique: true,
    default: "",
    trim: true,
    required: true
  },
  company: {
    type: String,
    unique: true,
    default: "",
    trim: true,
    required: true
  },
  password: {
    type: String,
    default: "",
    trim: true,
    required: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
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
