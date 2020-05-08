const {JobLink} = require('../util/models');

// Function to find and populate job link.
async function find(findMethod, params) {
    return await JobLink[findMethod](params).populate({
        path: 'users',
        model: 'users'
    }).populate({
        path: 'job',
        model: 'jobs',
        populate: [
            {
                path: 'careOffParties',
                model: 'careOffParties'
            },
            {
                path: 'paymentTrackers',
                model: 'paymentTrackers'
            }
        ]
    }).select();
}

// Function to create new job link.
async function create(data) {
    const jobLink = new JobLink({
        ...data
    });
    await jobLink.save();

    return jobLink;
}

module.exports.find = find;
module.exports.create = create;