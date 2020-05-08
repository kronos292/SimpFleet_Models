const {PaymentTracker} = require('../util/models');

// Function to find and populate payment tracker.
async function find(findMethod, params) {
    return await PaymentTracker[findMethod](params).select();
}

// Function to create new payment tracker.
async function create(data) {
    const paymentTracker = new PaymentTracker({
        ...data
    });
    await paymentTracker.save();

    return paymentTracker;
}

// Function to update payment tracker.
async function update(params, data) {
    let paymentTracker = await find('findOne', params);
    paymentTracker = await PaymentTracker.findByIdAndUpdate(paymentTracker._id, data, {new: true});
    return paymentTracker;
}

module.exports.find = find;
module.exports.create = create;
module.exports.update = update;