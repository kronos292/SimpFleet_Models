const mongoose = require('mongoose');
const {Schema} = mongoose;

const schema = new Schema({
    roleName: {type: String, default: ""} // Name of the admin role.
});

module.exports = mongoose.model('adminRoles', schema);
