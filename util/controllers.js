// controller import function to prevent repetitive imports across whole app.
module.exports = {
    jobController: require('../controllers/jobController'),
    jobTripController: require('../controllers/jobTripController'),
    userController: require('../controllers/userController'),
    notificationController: require('../controllers/notificationController'),
    jobAssignmentController: require('../controllers/jobAssignmentController'),
    careOffPartyController: require('../controllers/careOffPartyController'),
    jobFileController: require('../controllers/jobFileController'),
    jobLinkController: require('../controllers/jobLinkController'),
    paymentTrackerController: require('../controllers/paymentTrackerController'),
    xeroController: require('../controllers/xeroController'),
    invoiceController: require('../controllers/invoiceController'),
    jobChargeController: require('../controllers/jobChargeController'),
    companyAccountContactController: require('../controllers/companyAccountContactController'),
    userCompanyController: require('../controllers/userCompanyController'),
    vehicleController: require('../controllers/vehicleController'),
    jobPaymentController: require('../controllers/jobPaymentController'),
    jobRequestController: require('../controllers/jobRequestController'),
    productSuiteController: require('../controllers/productSuiteController'),
    jobTrackerController: require('../controllers/jobTrackerController'),
};