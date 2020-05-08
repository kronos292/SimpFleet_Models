const {CompanyAccountContact} = require('../util/models');

async function create(data) {
    const companyAccountContact = new CompanyAccountContact({
        userCompany: data.userCompany,
        xeroContactGroupId: data.xeroContactGroupId
    });
    await companyAccountContact.save();

    return companyAccountContact;
}

module.exports = {
    create
};
