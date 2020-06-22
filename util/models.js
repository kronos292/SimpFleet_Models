// model import function to prevent repetitive imports across whole app.
module.exports = {
    Job: require('../models/Job'),
    JobTrip: require('../models/JobTrip'),
    JobTripSequence: require('../models/JobTripSequence'),
    IdIndex: require('../models/IdIndex'),
    JobPricingBreakdown: require('../models/JobPricingBreakdown'),
    Vessel: require('../models/Vessel'),
    MarineTrafficVessel: require('../models/MarineTrafficVessel'),
    JobTracker: require('../models/JobTracker'),
    PaymentTracker: require('../models/PaymentTracker'),
    User: require('../models/User'),
    CareOffParty: require('../models/CareOffParty'),
    JobItem: require('../models/JobItem'),
    JobOfflandItem: require('../models/JobOfflandItem'),
    Notification: require('../models/Notification'),
    PSAVessel: require('../models/PSAVessel'),
    PSAQuayCraneSequence: require('../models/PSAQuayCraneSequence'),
    JobAssignment: require('../models/JobAssignment'),
    PickupLocation: require('../models/PickupLocation'),
    PickupDetail: require('../models/PickupDetail'),
    UserCompany: require('../models/UserCompany'),
    Location: require('../models/Location'),
    JobFile: require('../models/JobFile'),
    JobLink: require('../models/JobLink'),
    XeroAccessToken: require('../models/XeroAccessToken'),
    VesselLoadingLocation: require('../models/VesselLoadingLocation'),
    Invoice: require('../models/accounts/Invoice'),
    JobCharge: require('../models/accounts/JobCharge'),
    JobPayment: require('../models/accounts/JobPayment'),
    CompanyAccountContact: require('../models/accounts/CompanyAccountContact'),
    Vehicle: require('../models/Vehicle'),
    JobCostingBreakdown: require('../models/JobCostingBreakdown'),
    PaymentInvoiceUpload: require('../models/accounts/PaymentInvoiceUpload'),
    LogisticsUser: require('../models/LogisticsUser'),
    LogisticsCompany: require('../models/LogisticsCompany'),
    JobRequest: require('../models/JobRequest'),
    ExpoPushNotification: require('../models/notification/ExpoPushNotification'),
    ExpoPushNotificationToken: require('../models/notification/ExpoPushNotificationToken'),
    ProductSuite: require('../models/products/ProductSuite'),
    OfflandDetail: require('../models/OfflandDetail'),
    OfflandLocation: require('../models/OfflandLocation'),
    JobStatus: require('../models/JobStatus'),
    TransportUser: require('../models/TransportUser'),
    LighterBoatCompany: require('../models/lighters/LighterBoatCompany'),
    LighterBoat: require('../models/lighters/LighterBoat'),
    CreditWallet: require('../models/credits/CreditWallet'),
    CreditLog: require('../models/credits/CreditLog'),
};
