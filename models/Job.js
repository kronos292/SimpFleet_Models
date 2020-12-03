const mongoose = require('mongoose');
const { Schema } = mongoose;

const jobSchema = new Schema({
    jobId: {type: String, default: ''},
    vessel: {type: Schema.Types.ObjectId, ref: 'vessels'},
    jobTrackers: [{type: Schema.Types.ObjectId, ref: 'jobTrackers'}],
    paymentTrackers: [{type: Schema.Types.ObjectId, ref: 'paymentTrackers'}],
    vesselLoadingLocation: {type: Schema.Types.ObjectId, ref: 'vesselLoadingLocations'},
    otherVesselLoadingLocation: {type: String, default: ''},
    otherVesselLoadingLocationObj: {type: Schema.Types.ObjectId, ref: 'locations'},
    user: {type: Schema.Types.ObjectId, ref: 'users'},
    index: {type: String, default: ''},
    jobItems: [{type: Schema.Types.ObjectId, ref: 'jobItems'}],
    jobOfflandItems: [{type: Schema.Types.ObjectId, ref: 'jobOfflandItems'}],
    jobAdditionalItems: [{type: Schema.Types.ObjectId, ref: 'jobAdditionalItems'}],
    careOffParties: [{type: Schema.Types.ObjectId, ref: 'careOffParties'}],
    jobBookingDateTime: {type: Date, default: new Date()},
    vesselArrivalDateTime: {type: Date, default: null},
    remarks: {type: String, default: ''},
    adminRemarks: {type: String, default: ''}, // Remarks only input and seen by the admin accounts.
    vesselLoadingDateTime: {type: Date, default: null},
    psaBerthingDateTime: {type: Date, default: null},
    psaUnberthingDateTime: {type: Date, default: null},
    googleCalendarId: {type: String, default: ''},
    isCancelled: {type: String, default: 'Nil'},
    cancellationRemarks: {type: String, default: ''},
    isArchived: {type: Boolean, default: false},
    createDSA: {type: Boolean, default: false},
    createOfflandPermit: {type: Boolean, default: false},
    hasBoarding: {type: Boolean, default: false},
    hasDGItems: {type: Boolean, default: false}, // Whether there are DG items.
    pickup: {type: Boolean, default: false},
    pickupDetails: [{type: Schema.Types.ObjectId, ref: 'pickupDetails'}],
    offlandDetails: [{type: Schema.Types.ObjectId, ref: 'offlandDetails'}],
    vesselLighterName: {type: String, default: ''},
    vesselLighterLocation: {type: String, default: ''},
    vesselLighterCompany: {type: String, default: ''},
    lighterBoatCompanies: [{type: Schema.Types.ObjectId, ref: 'lighterBoatCompanies'}],
    vesselLighterRemarks: {type: String, default: ''},
    vesselAnchorageLocation: {type: Schema.Types.ObjectId, ref: 'sgAnchorageLocations'}, // Where the vessel of the job is anchored at (for anchorage jobs only)
    jobTrip: {type: Schema.Types.ObjectId, ref: 'jobTrips'},
    psaQuayCraneSequences: [{type: Schema.Types.ObjectId, ref: 'psaQuayCraneSequences'}],
    jobTrackerRemarks: {type: String, default: ''},
    psaVoyageNumberIn: {type: String, default: ""},
    psaVoyageNumberOut: {type: String, default: ""},
    psaBerf: {type: String, default: ""},
    telegramMessageId: {type: String, default: ""},
    estimatedJobPricingBreakdowns: [{type: Schema.Types.ObjectId, ref: 'jobPricingBreakdowns'}],
    actualJobPricingBreakdowns: [{type: Schema.Types.ObjectId, ref: 'jobPricingBreakdowns'}],
    isDeleted: {type: Boolean, default: false}, // For jobs that are accidentally created or for testing, and need to be removed from actual job count.
    status: {type: String, default: "PENDING"}, // PENDING, APPROVED, NO_MATCH, CANCELLED
    boardingName: {type: String, default: ''},
    boardingContact: {type: String, default: ''},
    jobPICName: {type: String, default: ''},
    jobPICContact: {type: String, default: ''},
    services: [{type: Schema.Types.Mixed, default: ''}], // Services required in a job
    version: {type: Number, default: 1},
});

module.exports = mongoose.model('jobs', jobSchema);
