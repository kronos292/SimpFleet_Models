const {UserCompany} = require('../util/models');

async function find(findMethod, params) {
    return await UserCompany[findMethod](params).populate({
        path: 'companyAccountContact',
        model: 'companyAccountContacts',
        populate: {
            path: 'userCompany',
            model: 'userCompanies'
        }
    }).populate({
        path: 'productSuites',
        model: 'productSuites'
    }).populate({
        path: 'logisticsCompanies',
        model: 'logisticsCompanies'
    }).select();
}

async function update(data) {
    const userCompany = await find('findOne', {_id: data._id});
    userCompany.name = data.name;
    userCompany.companyAccountContact = data.companyAccountContact;
    userCompany.logisticsCompanies = data.logisticsCompanies;
    await userCompany.save();

    return userCompany;
}

async function create(data) {
    // Get default product Suite
    const {productSuiteController} = require('../util/controllers');
    const productSuites = await productSuiteController.getDefault();

    let userCompany = null;
    if(productSuites) {
        userCompany = new UserCompany({
            ...data,
            productSuites
        });
        await userCompany.save();
    }

    return userCompany;
}

module.exports = {
    find,
    update,
    create
};
