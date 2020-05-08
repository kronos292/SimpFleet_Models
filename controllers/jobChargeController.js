const {JobCharge, IdIndex} = require('../util/models');
const telegramBotMethods = require('simpfleet_models/telegram/telegramBotMethods');

async function find(findMethod, params) {
    return await JobCharge[findMethod](params).populate({
        path: 'job',
        model: 'jobs',
        populate: [
            {
                path: 'estimatedJobPricingBreakdowns',
                model: 'jobPricingBreakdowns'
            },
            {
                path: 'user',
                model: 'users',
                populate: {
                    path: 'userCompany',
                    model: 'userCompanies',
                    populate: {
                        path: 'companyAccountContact',
                        model: 'companyAccountContacts'
                    }
                }
            }
        ]
    }).populate({
        path: 'invoice',
        model: 'invoices'
    }).select();
}

async function create(data) {
    // Get Job Charge count.
    const fullYear = `${new Date().getFullYear()}`;
    let idIndex = await IdIndex.findOne({type: `JOB_CHARGE_INDEX_${fullYear}`}).select();
    const indexCount = idIndex.index + 1;

    // Create Job Charge.
    const jobCharge = new JobCharge({
        id: `OJC${fullYear.substring(2, fullYear.length)}-${indexCount}`,
        dateTimeCreated: new Date(),
        ...data
    });
    await jobCharge.save();

    // Update Job Charge index
    idIndex.index = indexCount;
    await idIndex.save();

    // Create Invoice
    const {invoiceController} = require('../util/controllers');
    const invoice = await invoiceController.update({
        type: 'receivable',
        dateTimeIssued: null,
        dateTimeDue: null,
        dateTimePaid: null,
        jobCharge,
        status: 'Draft'
    });

    // Send created draft invoice via telegram.
    await telegramBotMethods.sendInvoiceFile(invoice);

    // Save Invoice ref in Job Charge.
    jobCharge.invoice = invoice;
    await jobCharge.save();
}

async function update(data) {
    // Get Job Charge object and update.
    const jobCharge = await find('findOne', {_id: data._id});
    jobCharge.status = data.status;
    jobCharge.description = data.description;
    jobCharge.remarks = data.remarks;
    await jobCharge.save();

    return jobCharge;
}

module.exports.find = find;
module.exports.create = create;
module.exports.update = update;
