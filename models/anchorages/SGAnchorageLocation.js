const mongoose = require('mongoose');
const { Schema } = mongoose;

// https://www.mpa.gov.sg/web/wcm/connect/www/30057e30-42e8-47b3-8715-0851d547ef04/pc18-02.pdf?MOD=AJPERES
const schema = new Schema({
    name: {type: String, default: ""}, // Anchorage name.
    code: {type: String, default: ""}, // Anchorage code.
    description: {type: String, default: ""}, // Anchorage description and its usage.
    isActive: {type: Boolean, default: false}, // Whether the Anchorage location is still active.
});

module.exports = mongoose.model('sgAnchorageLocations', schema);