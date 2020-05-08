const {Invoice} = require('../util/models');
const s3Methods = require('../../../services/s3Methods');

const keys = require('../config/keys');

async function find(findMethod, params) {
    return await Invoice[findMethod](params).populate({
        path: 'jobCharge',
        model: 'jobCharges',
        populate: {
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
        }
    }).populate({
        path: 'jobPayment',
        model: 'jobPayments'
    }).select();
}

// Function to update Invoice.
async function update(data) {
    // Find and update invoice with new data.
    let invoice = await find('findOne', {_id: data._id});
    if(!invoice) {
        // Create invoice object.
        invoice = new Invoice({
            dateTimeCreated: new Date(),
            type: data.type,
            jobCharge: data.jobCharge? data.jobCharge: null,
            jobPayment: data.jobPayment? data.jobPayment: null
        });
    }
    invoice.dateTimeIssued = data.dateTimeIssued;
    invoice.dateTimeDue = data.dateTimeDue;
    invoice.dateTimePaid = data.dateTimePaid;
    invoice.status = data.status;
    invoice.xeroContactId = data.xeroContactId? data.xeroContactId: '';

    try {
        // Create/Update invoice in Xero.
        const {xeroController} = require('../util/controllers');
        const xeroInvoice = await xeroController.updateInvoice(invoice);

        // Store Xero details in Invoice object.
        invoice.xeroId = xeroInvoice["invoiceID"];
        invoice.xeroNumber = xeroInvoice["invoiceNumber"];
        invoice.xeroContactId = xeroInvoice["Contact"]? xeroInvoice["Contact"]["ContactID"]: '';

        // Download invoice PDF from Xero.
        const file = await xeroController.getInvoiceFile(invoice.xeroId);

        // Get Job object from invoice.
        const {job} = invoice.jobCharge;

        // Derive invoice name.
        const statusString = invoice.status !== 'Authorised'? '_Draft': '';
        const invoiceFileName = `invoice_${job.index}${statusString}.pdf`;

        // Upload invoice to S3.
        let fileURL = '';
        try {
            const bucket = keys.S3_BUCKET;
            const subDirectory = `job-receivables`;
            fileURL = `https://s3-ap-southeast-1.amazonaws.com/${bucket}/${subDirectory}/${invoice._id}/${invoiceFileName}`;
            await s3Methods.updateFile(bucket, `${subDirectory}/${invoice._id}/${invoiceFileName}`, file, 'private');

            // Save fileURL of invoice.
            invoice.fileURL = fileURL;
        } catch(err) {
            console.log(err);
        }
    } catch(err) {
        console.log(err);
    } finally {
        await invoice.save();
    }

    return invoice;
}

// Function to send Invoice via email.
async function email(data) {
    const invoice = await find('findOne', {_id: data._id});

    // Send Invoice via email.
    const {xeroController} = require('../util/controllers');
    await xeroController.sendInvoice(invoice.xeroId);
}

module.exports.find = find;
module.exports.update = update;
module.exports.email = email;
