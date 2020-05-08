const xero_node = require('xero-node');
const {Invoice, Invoices, LineAmountTypes, CurrencyCode, Contacts} = require('xero-node');

const keys = require('../../../config/keys');
const {XeroAccessToken} = require('../util/models');
const {companyAccountContactController, userCompanyController} = require('../util/controllers');

const client_id = keys.XERO_CLIENT_ID;
const client_secret = keys.XERO_CLIENT_SECRET;
const redirectUri = process.env.NODE_ENV === 'production'? 'https://www.simpfleet.com/api/xero/callback': 'http://localhost:5000/api/xero/callback';
const scopes = 'openid profile email accounting.settings accounting.reports.read accounting.journals.read accounting.contacts accounting.attachments accounting.transactions offline_access';

const xero = new xero_node.XeroClient({
    clientId: client_id,
    clientSecret: client_secret,
    redirectUris: [redirectUri],
    scopes: scopes.split(" ")
});

async function authenticate() {
    const xeroAccessTokens = await XeroAccessToken.find().select();
    const {accessToken} = xeroAccessTokens.reverse()[0];
    await xero.setTokenSet(accessToken);
    await xero.updateTenants();
}

async function getContactGroup(userCompany) {
    await authenticate();

    let {companyAccountContact} = userCompany;

    if(companyAccountContact) {
        const {xeroContactGroupId} = companyAccountContact;
        const xeroContactGroupRes = await xero.accountingApi.getContactGroup(xero.tenants[0].tenantId, xeroContactGroupId);
        return xeroContactGroupRes.body.contactGroups[0];
    } else {
        // Create Contact Group on Xero.
        const xeroContactGroupRes = await xero.accountingApi.createContactGroup(xero.tenants[0].tenantId, {
            contacts: [
                {
                    name: `${userCompany.name} Contact Group`
                }
            ]
        }).body.contactGroups[0];
        const xeroContactGroup = xeroContactGroupRes.body.contactGroups[0];

        // Create Company Account Contact Model.
        companyAccountContact = await companyAccountContactController.create({
            userCompany: userCompany,
            xeroContactGroupId: xeroContactGroup.contactGroupID
        });

        // Update User Company with company account contact model.
        await userCompanyController.update({
            name: userCompany.name,
            companyAccountContact
        });

        return xeroContactGroup;
    }
}

async function addContact(userCompany) {
    // Get contact group of the company.
    const xeroContactGroup = await getContactGroup(userCompany);

    // Create Xero Contact.
    // const contact = { name: "Rick James: " + num, firstName: "Rick", lastName: "James", emailAddress: `foo+${num}@example.com` };
    // const contacts = new Contacts();
    // contacts.contacts = [contact];
    // const contactCreateResponse = await xero.accountingApi.createContacts(xero.tenants[0].tenantId, contacts);
    // const createdContact = contactCreateResponse.body.contacts[0];
    // const updatedContactGroupParams = {
    //     contacts: [{ contactID: createdContact.contactID }]
    // };
    // await xero.accountingApi.createContactGroupContacts(xero.tenants[0].tenantId, xeroContactGroup.contactGroupID, updatedContactGroupParams);
}

async function getContact(contactId) {
    const contactGetResponse = await xero.accountingApi.getContact(xero.tenants[0].tenantId, contactId);
    return contactGetResponse.body.contacts[0];
}

async function connect() {
    try {
        return await xero.buildConsentUrl();
    } catch (err) {
        console.log(err);
    }
}

async function getToken(url) {
    try {
        const accessToken = await xero.apiCallback(url);
        const xeroAccessToken = new XeroAccessToken({
            accessToken
        });
        await xeroAccessToken.save();

        return xeroAccessToken;
    } catch (err) {
        console.log(err);
    }
}

async function getInvoices() {
    try {
        await authenticate();
        const res = await xero.accountingApi.getInvoices(xero.tenants[0].tenantId);
        return res.body;
    } catch (err) {
        console.log(err);
    }
}

async function updateInvoice(data) {
    try {
        await authenticate();

        const type = data.type === 'receivable'? 'ACCREC': 'ACCPAY';
        const {jobCharge, xeroNumber, status, dateTimeIssued, dateTimeDue, xeroContactId} = data;
        const {job} = jobCharge;
        const {estimatedJobPricingBreakdowns} = job;

        // Get Contact.
        let xeroContact = null;
        if(xeroContactId && xeroContactId !== '') {
            const xeroContactRes = await xero.accountingApi.getContact(xero.tenants[0].tenantId, xeroContactId);
            xeroContact = xeroContactRes.body.contacts[0];
        } else {
            const xeroContactRes = await xero.accountingApi.getContacts(xero.tenants[0].tenantId);
            xeroContact = xeroContactRes.body.contacts[0];
        }

        // Create Line Items.
        const lineItems = [];
        for(let i = 0; i < estimatedJobPricingBreakdowns.length; i++) {
            const estimatedJobPricingBreakdown = estimatedJobPricingBreakdowns[i];
            const {description, price, isDeleted} = estimatedJobPricingBreakdown;
            if(!isDeleted) {
                lineItems.push(
                    {
                        description,
                        taxType: "NONE",
                        quantity: 1,
                        unitAmount: price,
                        accountCode: "200"
                    }
                );
            }
        }

        // Create the invoice JSON.
        const invoice = {
            type,
            contact: {
                contactID: xeroContact.contactID
            },
            lineItems,
            // currencyCode: CurrencyCode.SGD
        };

        // If invoice data has Xero id, update JSON.
        if(xeroNumber && xeroNumber !== '') {
            invoice.invoiceNumber = xeroNumber;
        }

        // If invoice data has issued date, update JSON.
        if(dateTimeIssued) {
            invoice.date = dateTimeIssued;
        }

        // If invoice data has due date, update JSON.
        if(dateTimeDue) {
            invoice.dueDate = dateTimeDue;
        }

        // Set status of Invoice.
        if(status === 'Submitted') {
            invoice.status = Invoice.StatusEnum.SUBMITTED;
        } else if(status === 'Authorised') {
            invoice.status = Invoice.StatusEnum.AUTHORISED;
        } else {
            invoice.status = Invoice.StatusEnum.DRAFT;
        }

        // Create or Update Invoice.
        const invoices = new Invoices();
        invoices.invoices = [invoice];
        const invoiceObj = await xero.accountingApi.updateOrCreateInvoices(xero.tenants[0].tenantId, invoices, false);
        return invoiceObj.body.invoices[0];
    } catch(err) {
        console.log(err);
    }
}

async function getInvoiceFile(invoiceId) {
    try {
        await authenticate();

        const res = await xero.accountingApi.getInvoiceAsPdf(
            xero.tenants[0].tenantId,
            invoiceId,
            { headers: { accept: 'application/pdf' } }
        );

        return res.body;
    } catch(err) {
        console.log(err);
    }
}

async function sendInvoice(invoiceId) {
    try {
        await authenticate();

        const res = await xero.accountingApi.emailInvoice(xero.tenants[0].tenantId, invoiceId, {});

        return res.body;
    } catch(err) {
        console.log(err);
    }
}

module.exports = {
    connect,
    getToken,
    getInvoices,
    updateInvoice,
    getInvoiceFile,
    sendInvoice,
    getContactGroup,
    getContact
};
