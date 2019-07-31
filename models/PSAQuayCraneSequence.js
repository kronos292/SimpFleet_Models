const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    berthingSequence: {type: Number, default: 1},
    psaVoyage: {type: String, default: ''},
    seqTimeFrom: {type: Date, default: null},
    seqTimeTo: {type: Date, default: null}
});

module.exports = mongoose.model('psaQuayCraneSequences', schema);