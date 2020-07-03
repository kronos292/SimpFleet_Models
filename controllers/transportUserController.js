const {TransportUser} = require('../util/models');

// Function to find and populate data.
async function find(findMethod, params) {
    return await TransportUser[findMethod](params).populate({
        path: "company",
        model: "logisticsCompanies"
    }).populate({
        path: "expoPushNotificationTokens",
        model: "expoPushNotificationTokens"
    }).select();
}

module.exports = {
    find
}