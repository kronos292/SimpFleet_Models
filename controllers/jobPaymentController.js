const {JobPayment, IdIndex} = require('../util/models');

async function find(findMethod, params) {
    return await JobPayment[findMethod](params).populate({
        path: 'jobTrip',
        model: 'jobTrips',
        populate: [
            {
                path: 'estimatedJobCostingBreakdowns',
                model: 'jobCostingBreakdowns'
            },
            {
                path: 'jobs',
                model: 'jobs'
            }
        ]
    }).populate({
        path: 'invoice',
        model: 'invoices'
    }).select();
}

async function create(data) {
    // Get Job payment count.
    const fullYear = `${new Date().getFullYear()}`;
    let idIndex = await IdIndex.findOne({type: `JOB_PAYMENT_INDEX_${fullYear}`}).select();
    const indexCount = idIndex.index + 1;

    // Create Job Payment.
    const jobPayment = new JobPayment({
        id: `OJP${fullYear.substring(2, fullYear.length)}-${indexCount}`,
        dateTimeCreated: new Date(),
        ...data
    });
    await jobPayment.save();

    // Update Job payment index.
    idIndex.index = indexCount;
    await idIndex.save();
}

module.exports = {
    find,
    create
};
