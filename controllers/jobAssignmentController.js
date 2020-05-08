const {JobAssignment} = require('../util/models');

// Function to find and populate job assignments.
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

module.exports.find = find;