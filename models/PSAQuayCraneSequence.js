const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    berthingSequence: {type: Number, default: 1},
    psaVoyage: {type: String, default: ''},
    ETB: {type: Date, default: null},
    ETU: {type: Date, default: null},
    seqTimeFrom: {type: Date, default: null},
    seqTimeTo: {type: Date, default: null}
});

module.exports = mongoose.model('psaQuayCraneSequences', schema);