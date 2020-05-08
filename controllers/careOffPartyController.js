const {CareOffParty} = require('../util/models');

// Function to find and populate care-off party.
async function find(findMethod, params) {
    return await CareOffParty[findMethod](params).populate({
        path: 'job',
        model: 'jobs',
        populate: [
            {
                path: 'vessel',
                model: 'vessels',
            },
            {
                path: 'user',
                model: 'users',
                populate: {
                    path: 'userCompany',
                    model: 'userCompanies'
                }
            },
            {
                path: 'jobTrackers',
                model: 'jobTrackers'
            },
            {
                path: 'paymentTrackers',
                model: 'paymentTrackers'
            },
            {
                path: 'careOffParties',
                model: 'careOffParties',
                populate: [
                    {
                        path: 'job',
                        model: 'jobs'
                    }
                ]
            },
            {
                path: 'jobItems',
                model: 'jobItems'
            },
            {
                path: 'jobOfflandItems',
                model: 'jobOfflandItems'
            }
        ]
    }).select();
}

// Function to create new care-off party.
async function create(data) {
    const careOffParty = new CareOffParty({
        ...data
    });
    await careOffParty.save();

    return careOffParty;
}

// Function to update care-off party.
async function update(params, data) {
    let careOffParty = await find('findOne', params);
    if(careOffParty) {
        careOffParty = await CareOffParty.findByIdAndUpdate(careOffParty._id, data, {new: true});
    }
    return careOffParty;
}

module.exports.find = find;
module.exports.create = create;
module.exports.update = update;
