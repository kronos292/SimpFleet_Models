const {LighterBoatCompany} = require('../util/models');

async function find(findMethod, params) {
    return await LighterBoatCompany[findMethod](params).select();
}

module.exports = {
    find
};
