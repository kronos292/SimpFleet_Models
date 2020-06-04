const {LighterBoat} = require('../util/models');

async function find(findMethod, params) {
    return await LighterBoat[findMethod](params).select();
}

module.exports = {
    find
};
