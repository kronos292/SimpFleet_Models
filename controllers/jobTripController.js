const {JobTrip} = require('../util/models');

async function find(findMethod, params) {
    return await JobTrip[findMethod](params).populate({
        path: 'jobTripSequences',
        model: 'jobTripSequences',
        populate: [
            {
                path: 'driver',
                model: 'drivers'
            },
            {
                path: 'job',
                model: 'jobs'
            }
        ]
    }).populate({
        path: 'jobs',
        model: 'jobs',
        populate: [
            {
                path: 'vessel',
                model: 'vessels'
            },
            {
                path: 'vesselLoadingLocation',
                model: 'vesselLoadingLocations',
                populate: {
                    path: 'location',
                    model: 'locations'
                }
            },
            {
                path: 'pickupDetails',
                model: 'pickupDetails',
                populate: [
                    {
                        path: 'pickupLocation',
                        model: 'pickupLocations'
                    }
                ]
            },
            {
                path: 'estimatedJobPricingBreakdowns',
                model: 'jobPricingBreakdowns'
            }
        ]
    }).populate({
        path: 'vehicle',
        model: 'vehicles'
    }).populate({
        path: 'estimatedJobCostingBreakdowns',
        model: 'jobCostingBreakdowns'
    }).select();
}

module.exports.find = find;
