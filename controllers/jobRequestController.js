const {JobRequest, JobAssignment} = require('../util/models');
const expoNotificationServices = require('../services/expoNotificationServices');

async function find(findMethod, params) {
    return await JobRequest[findMethod](params).populate({
        path: "job",
        model: "jobs",
        populate: [
            {
                path: "vessel",
                select: "vesselIMOID vesselName -_id",
            },
            {
                path: "jobTrackers",
                select: "timestamp title -_id",
                options: {
                    sort: {
                        vesselArrivalDateTime: -1,
                    },
                },
                populate: [
                    {
                        path: "jobTrackerItemCheckLists",
                        model: "jobTrackerItemCheckLists",
                    },
                ],
            },
            {
                path: "careOffParties",
                model: "careOffParties",
                populate: [
                    {
                        path: "job",
                        model: "jobs",
                    },
                ],
            },
            {
                path: "jobItems",
                model: "jobItems",
            },
            {
                path: "jobOfflandItems",
                model: "jobOfflandItems",
            },
            {
                path: "user",
                model: "users",
                populate: [
                    {
                        path: "userCompany",
                        model: "userCompanies",
                    },
                ],
            },
            {
                path: "pickupDetails",
                model: "pickupDetails",
                populate: [
                    {
                        path: "pickupLocation",
                        model: "pickupLocations",
                    },
                ],
            },
            {
                path: "vesselLoadingLocation",
                model: "vesselLoadingLocations",
            },
            {
                path: "jobTrip",
                model: "jobTrips",
            },
        ],
    }).populate({
        path: "logisticsCompany",
        model: "logisticsCompanies",
    }).populate({
        path: "expoPushNotifications",
        model: "expoPushNotifications",
    }).select();
}

async function create(data) {
    const jobRequest = new JobRequest({
        ...data
    });
    await jobRequest.save();

    return jobRequest;
}

// Function to update data
async function update(data) {
    let jobRequest = await find('findOne', {_id: data._id});
    const {job, logisticsCompany} = jobRequest;

    // Compare db data and new data.
    if(jobRequest.status === 'PENDING' && data.status === 'ACCEPTED') {
        // If status is changed from pending to accepted, Check for acceptance by other 3PLs.
        // If no other 3PLs have accepted the job already, assign the job to this 3PL.
        const jobAssignment = await JobAssignment.findOne({
            job: job._id
        }).populate({
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
        if(jobAssignment) {
            if(jobAssignment.status === 'Pending') {
                jobAssignment.status = 'Assigned';
                jobAssignment.logisticsCompany = logisticsCompany._id;
                await jobAssignment.save();

                // Send job assignment expo notification.
                await expoNotificationServices.sendJobAssignmentNotifications(jobAssignment);

                const jobRequests = await find('find', {job: job._id, status: 'PENDING'});
                for(let i = 0; i < jobRequests.length; i++) {
                    jobRequests[i].status = 'PASSED';
                    await jobRequests[i].save();
                }
            } else if(jobAssignment.status === 'Assigned') {
                const jobRequests = await find('find', {job: job._id, status: 'PENDING'});
                for(let i = 0; i < jobRequests.length; i++) {
                    jobRequests[i].status = 'PASSED';
                    await jobRequests[i].save();
                }
            }
        }
    }

    // Update db data.
    jobRequest = await JobRequest.findByIdAndUpdate(jobRequest._id, data, {new: true});
    return jobRequest;
}

module.exports = {
    find,
    create,
    update
};