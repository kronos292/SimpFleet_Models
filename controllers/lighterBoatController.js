const {LighterBoat} = require('../util/models');

async function find(findMethod, params) {
    return await LighterBoat[findMethod](params).populate({
        path: 'lighterBoatCompany',
        model: 'lighterBoatCompanies'
    }).select();
}

module.exports = {
    find
};
