const {JobAssignment} = require('../util/models');

// Function to find and populate data.
async function find(findMethod, params) {
    return await JobAssignment[findMethod](params).populate({
        path: "job",
        model: "jobs",
        populate: [
            {
                path: "user",
                model: "users",
                populate: {
                    path: "userCompany",
                    model: "userCompanies"
                }
            },
            {
                path: "vessel",
                model: "vessels",
            },
            {
                path: "vesselLoadingLocation",
                model: "vesselLoadingLocations",
            }
        ]
    }).populate({
        path: "logisticsCompany",
        model: "logisticsCompanies"
    }).select();
}

// Function to find and update data.
async function update(data) {
    let jobAssignment = await find('findOne', {_id: data._id});
    jobAssignment = {
        ...data
    }
    await jobAssignment.save();
    return jobAssignment;
}

module.exports = {
    find,
    update
};