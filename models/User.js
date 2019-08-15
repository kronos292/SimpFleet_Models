const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');

const { Schema } = mongoose;

const userSchema = new Schema({
    firstName: {type: String, default: ""},
    lastName: {type: String, default: ""},
    password: {type: String, default: ""},
    email: {type: String, default: ""},
    companyName: {type: String, default: ""},
    contactNumber: {type: String, default: ""},
    userType: {type: String, default: ""},
    isApproved: {type: Boolean, default: false},
    token: {type: String, default: ""},
    registerDate: {type: Date, default: new Date()},
    resetPasswordToken: {type: String, default: ""},
    resetPasswordExpiry: {type: String, default: ""}
});

// // generating a hash
// userSchema.methods.generateHash = function (password) {
//     return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
// };
//
// // checking if password is valid
// userSchema.methods.validPassword = function (password) {
//     return bcrypt.compareSync(password, this.password);
// };

// Generate JWT
// userSchema.methods.generateAuthToken = function() {
//     this.token = jwt.sign({ _id: this._id, userType: this.userType }, keys.jwtPrivateKey);
//     return this.token;
// };

module.exports = mongoose.model('users', userSchema);
