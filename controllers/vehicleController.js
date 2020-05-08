const {Vehicle} = require('../util/models');

async function find(findMethod, params) {
    return await Vehicle[findMethod](params).populate({
        path: 'logisticsCompany',
        model: 'logisticsCompanies'
    }).select();
}

async function create(data) {
    const vehicle = new Vehicle({
        id: data.id,
        licenseNumber: data.licenseNumber,
        type: data.type,
        truckType: data.truckType,
        size: data.size,
        weightLimit: data.weightLimit,
        palletCapacity: data.palletCapacity,
        logisticsCompany: data.logisticsCompany
    });
    await vehicle.save();

    return vehicle;
}

module.exports = {
    find,
    create
};
