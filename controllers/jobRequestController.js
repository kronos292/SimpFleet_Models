const {JobRequest} = require('../util/models');
const {jobAssignmentController} = require('../util/controllers');
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
        const jobAssignment = await jobAssignmentController.find('findOne', {
            job: job._id
        });
        if(jobAssignment && jobAssignment.status === 'Pending') {
            const jobAssignment = await jobAssignmentController.update({
                status: 'Assigned',
                logisticsCompany: logisticsCompany._id
            });

            // Send job assignment expo notification.
            await expoNotificationServices.sendJobAssignmentNotifications(jobAssignment);
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