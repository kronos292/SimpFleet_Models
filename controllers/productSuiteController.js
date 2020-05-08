const {ProductSuite} = require('../util/models');

async function find(findMethod, params) {
    return await ProductSuite[findMethod](params).select();
}

async function getDefault() {
    const defaultProductSuites = ['LAST_MILE_TRANSPORT'];
    return await find('find', { type: {$in: defaultProductSuites} });
}

module.exports = {
    find,
    getDefault
};