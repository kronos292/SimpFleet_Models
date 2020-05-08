const {Job} = require('../util/models');

async function find(findMethod, params) {
    return await Job[findMethod](params).populate({
        path: 'vessel',
        model: 'vessels'
    }).populate({
        path: 'vesselLoadingLocation',
        model: 'vesselLoadingLocations',
        populate: {
            path: 'location',
            model: 'locations'
        }
    }).populate({
        path: 'user',
        model: 'users',
        populate: {
            path: 'userCompany',
            model: 'userCompanies'
        }
    }).populate({
        path: 'jobTrackers',
        model: 'jobTrackers'
    }).populate({
        path: 'paymentTrackers',
        model: 'paymentTrackers'
    }).populate({
        path: 'pickupDetails',
        model: 'pickupDetails',
        populate: [
            {
                path: 'pickupLocation',
                model: 'pickupLocations'
            }
        ]
    }).populate({
        path: 'careOffParties',
        model: 'careOffParties',
        populate: [
            {
                path: 'job',
                model: 'jobs'
            }
        ]
    }).populate({
        path: 'jobItems',
        model: 'jobItems'
    }).populate({
        path: 'jobOfflandItems',
        model: 'jobOfflandItems'
    }).populate({
        path: 'jobTrip',
        model: 'jobTrips'
    }).populate({
        path: 'estimatedJobPricingBreakdowns',
        model: 'jobPricingBreakdowns'
    }).select();
}

module.exports.find = find;