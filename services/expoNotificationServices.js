const axios = require('axios');
const moment = require('moment');
const _ = require('lodash');

const {LogisticsUser, LogisticsCompany, ExpoPushNotification, JobRequest, JobAssignment, LogisticsService} = require('../util/models');
const {jobController, jobAssignmentController} = require('../util/controllers');

// Get job assignment from job id.
async function getJobAssignments(job) {
    return await JobAssignment.find({job: job._id}).populate({
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
    }).populate({
        path: "logisticsService",
        model: "logisticsServices"
    }).select();
}

// Get expo tokens of all users in a logistics company.
async function getExpoTokensOfLogisticsCompany(logisticsCompany) {
    // Get logistics users of the company. Check if they have Expo push notifications.
    const logisticsUsers = await LogisticsUser.find({company: logisticsCompany._id}).populate({
        path: 'expoPushNotificationTokens',
        model: 'expoPushNotificationTokens'
    }).select();
    const expoPushNotifications = [];
    for(let j = 0; j < logisticsUsers.length; j++) {
        const logisticsUser = logisticsUsers[j];
        const {expoPushNotificationTokens} = logisticsUser;
        if(expoPushNotificationTokens) {
            // Send to all tokens a logistics user has.
            for(let k = 0; k < expoPushNotificationTokens.length; k++) {
                const expoPushNotificationToken = expoPushNotificationTokens[k];
                const expoPushNotification = new ExpoPushNotification({
                    expoPushNotificationToken,
                    status: 'SENT'
                });
                await expoPushNotification.save();
                expoPushNotifications.push(expoPushNotification);
            }
        }
    }
    return expoPushNotifications;
}

// Send expo notification via token.
async function buildExpoNotification(expoPushNotificationTokens, title, body, data) {
    for(let i = 0; i < expoPushNotificationTokens.length; i++) {
        const expoPushNotificationToken = expoPushNotificationTokens[i];
        const {token} = expoPushNotificationToken;

        try {
            // Send push notification.
            const res = await axios.post('https://exp.host/--/api/v2/push/send', {
                to: token,
                title,
                body,
                data,
                ttl: 60 * 60 * 24,
                priority: 'high',
                sound: 'default'
            }, {
                headers: {
                    'host': 'exp.host',
                    'accept': 'application/json',
                    'accept-encoding': 'gzip, deflate',
                    'content-type': 'application/json'
                }
            });
            console.log(res.data);
        } catch(err) {
            console.log(err.response.data.errors);
        }
    }
}

// Extract tokens from expo notifications to send.
async function sendExpoNotifications(expoPushNotifications, title, body, data) {
    const expoPushNotificationTokens = [];
    for(let i = 0; i < expoPushNotifications.length; i++) {
        const expoPushNotification = expoPushNotifications[i];
        const {expoPushNotificationToken} = expoPushNotification;
        expoPushNotificationTokens.push(expoPushNotificationToken);
    }
    await buildExpoNotification(expoPushNotificationTokens, title, body, data);
}

async function sendJobRequestNotifications(job) {
    // Get Logistics companies and get all expo tokens.
    const logisticsCompanies = await LogisticsCompany.find().populate({
        path: "logisticsServices",
        model: "logisticsServices"
    }).select();

    const {services} = job;
    const makeTruckBooking = _.find(services, ['key', 'TRUCK_BOOKING']);
    const makeLighterBooking = _.find(services, ['key', 'BOAT_BOOKING']);
    const jobRequestLogisticsServices = [];
    if(makeTruckBooking) {
        const logisticsService = await LogisticsService.findOne({type: 'TYPE_TRUCK'}).select();
        jobRequestLogisticsServices.push(logisticsService);
    }
    if(makeLighterBooking) {
        const logisticsService = await LogisticsService.findOne({type: 'TYPE_BOAT'}).select();
        jobRequestLogisticsServices.push(logisticsService);
    }

    const jobRequests = [];
    for(let i = 0; i < logisticsCompanies.length; i++) {
        const logisticsCompany = logisticsCompanies[i];
        const {logisticsServices} = logisticsCompany;
        if(logisticsServices) {
            let validLogisticsCompany = true;

            // Attempt to see if logistics company provides the truck service.
            if(makeTruckBooking) {
                if(!_.find(logisticsServices, ['type', 'TYPE_TRUCK'])) {
                    validLogisticsCompany = false;
                }
            }

            // Attempt to see if logistics company provides the boat service.
            if(makeLighterBooking) {
                if(!_.find(logisticsServices, ['type', 'TYPE_BOAT'])) {
                    validLogisticsCompany = false;
                }
            }

            // If logistics company provides the services, send the push notifications.
            if(validLogisticsCompany) {
                // Get logistics users of the company. Check if they have Expo push notifications.
                const expoPushNotifications = await getExpoTokensOfLogisticsCompany(logisticsCompany);

                // Send job requests only if expo tokens can be found.
                if(expoPushNotifications.length > 0) {
                    const jobRequest = new JobRequest({
                        job: job._id,
                        logisticsCompany: logisticsCompany._id,
                        expoPushNotifications,
                        status: 'PENDING',
                        logisticsServices: jobRequestLogisticsServices
                    });
                    await jobRequest.save();
                    jobRequests.push(jobRequest);
                }
            }
        }
    }

    // Send only if expo tokens can be found.
    if(jobRequests.length > 0) {
        for(let i = 0; i < jobRequests.length; i++) {
            const jobRequest = jobRequests[i];
            const {expoPushNotifications} = jobRequest;

            // Set notification details.
            const title = `New Job Request`;
            let {pickupDetails, index, vesselLoadingLocation, otherVesselLoadingLocation} = job;
            const vesselLoadingLocationName = vesselLoadingLocation.type !== 'others'? vesselLoadingLocation.name: otherVesselLoadingLocation;
            let body = `New job ${index}. Delivery to ${vesselLoadingLocationName}.`;
            if(pickupDetails.length > 0) {
                pickupDetails = pickupDetails.sort((a, b) => {
                    return a.pickupDateTime - b.pickupDateTime;
                });
                const pickupDetail = pickupDetails[0];
                const {pickupDateTime, pickupLocation} = pickupDetail;
                body += ` Pick up on ${moment(pickupDateTime).format('YYYY-MM-DD')} at ${moment(pickupDateTime).format('HH:mm:ss')}.`;
            }
            body += ' Click to accept/decline.';

            // Send out expo notifications.
            await sendExpoNotifications(expoPushNotifications, title, body, {
                jobId: job._id,
                jobRequestId: jobRequest._id,
                type: 'JOB_REQUEST'
            });
        }
    }
}

async function sendJobAssignmentNotifications(jobAssignment) {
    const {job, logisticsCompany} = jobAssignment;
    if(job && logisticsCompany) {
        // Get logistics users of the company. Check if they have Expo push notifications.
        const expoPushNotifications = await getExpoTokensOfLogisticsCompany(logisticsCompany);

        // Send only if expo tokens can be found.
        if(expoPushNotifications.length > 0) {
            jobAssignment.expoPushNotifications = expoPushNotifications;
            await jobAssignment.save();

            // Set notification details.
            const title = 'New Job Assigned';
            let {pickupDetails, index, vesselLoadingLocation, otherVesselLoadingLocation} = job;
            const vesselLoadingLocationName = vesselLoadingLocation.type !== 'others'? vesselLoadingLocation.name: otherVesselLoadingLocation;
            let body = `New job ${index} has been assigned to you. Delivery to ${vesselLoadingLocationName}.`;
            if(pickupDetails.length > 0) {
                pickupDetails = pickupDetails.sort((a, b) => {
                    return a.pickupDateTime - b.pickupDateTime;
                });
                const pickupDetail = pickupDetails[0];
                const {pickupDateTime, pickupLocation} = pickupDetail;
                body += ` Pick up on ${moment(pickupDateTime).format('YYYY-MM-DD')} at ${moment(pickupDateTime).format('HH:mm:ss')}.`;
            }
            body += ' Click to view more.';

            // Send out expo notifications.
            await sendExpoNotifications(expoPushNotifications, title, body, {
                jobId: job._id,
                type: 'JOB_ASSIGNMENT'
            });
        }
    }
}

async function sendJobDetailsUpdate(job) {
    const jobAssignments = await getJobAssignments(job);

    for(let i = 0; i < jobAssignments.length; i++) {
        const jobAssignment = jobAssignments[i];
        const {logisticsCompany} = jobAssignment;
        if(logisticsCompany) {
            // Get logistics users of the company. Check if they have Expo push notifications.
            const expoPushNotifications = await getExpoTokensOfLogisticsCompany(logisticsCompany);

            // Send only if expo tokens can be found.
            if(expoPushNotifications.length > 0) {
                // Set notification details.
                const title = 'Job Details Updated';
                const body = `Job Details for ${job.index} has been updated.`;

                // Send out expo notifications.
                await sendExpoNotifications(expoPushNotifications, title, body, {
                    jobId: job._id,
                    type: 'JOB_UPDATE'
                });
            }
        }
    }
}

async function sendPSAJobBerthUpdate(job) {
    const jobAssignments = await getJobAssignments(job);

    for(let i = 0; i < jobAssignments.length; i++) {
        const jobAssignment = jobAssignments[i];
        const {logisticsCompany} = jobAssignment;
        if(logisticsCompany) {
            // Get logistics users of the company. Check if they have Expo push notifications.
            const expoPushNotifications = await getExpoTokensOfLogisticsCompany(logisticsCompany);

            // Send only if expo tokens can be found.
            if(expoPushNotifications.length > 0) {
                // Set notification details.
                const title = 'Vessel Berthing details Updated';
                const body = `Vessel Berthing Details for ${job.index} has been updated.`;

                // Send out expo notifications.
                await sendExpoNotifications(expoPushNotifications, title, body, {
                    jobId: job._id,
                    type: 'JOB_UPDATE'
                });
            }
        }
    }
}

async function sendDriverAssignmentNotifications(transportUser, job) {
    const {vesselLoadingLocation, jobTrip} = job;

    // Set notification details.
    const title = 'Job Assignment to Drivers';
    const body = `Job ${job.index} has been assigned to you. Going to ${vesselLoadingLocation.name}.`;

    await buildExpoNotification(transportUser.expoPushNotificationTokens, title, body, {
        jobTripId: jobTrip._id,
        type: 'DRIVER_ASSIGNMENT'
    });
}

// Reminder to 3PL to assign driver to job.
async function sendDriverAssignmentReminders() {
    const jobs = await jobController.find('find', {});
    for(let i = 0; i < jobs.length; i++) {
        const job = jobs[i];
        const {jobTrackers, jobTrip} = job;
        if(jobTrackers.length < 6 && jobTrip && !jobTrip.driver) {
            const logisticsService = await LogisticsService.findOne({type: 'TYPE_TRUCK'}).select();
            const jobAssignment = await jobAssignmentController.find('findOne', {job: job._id, logisticsService});
            if(jobAssignment) {
                const {logisticsCompany} = jobAssignment;

                if(logisticsCompany) {
                    // Get logistics users of the company. Check if they have Expo push notifications.
                    const expoPushNotifications = await getExpoTokensOfLogisticsCompany(logisticsCompany);

                    // Send job requests only if expo tokens can be found.
                    if(expoPushNotifications.length > 0) {
                        // Set notification details.
                        const title = `Driver Assignment Reminder`;
                        let {pickupDetails, index, vesselLoadingLocation, otherVesselLoadingLocation} = job;
                        const vesselLoadingLocationName = vesselLoadingLocation.type !== 'others'? vesselLoadingLocation.name: otherVesselLoadingLocation;
                        let body = `No driver is currently assigned for job ${index}, delivery to ${vesselLoadingLocationName}. Reminder to assign as soon as possible.`;

                        // Send out expo notifications.
                        await sendExpoNotifications(expoPushNotifications, title, body, {
                            jobId: job._id,
                            type: '3PL_DRIVER_ASSIGNMENT_REMINDER'
                        });
                    }
                }
            }
        }
    }
}

module.exports = {
    sendJobRequestNotifications,
    sendJobAssignmentNotifications,
    sendJobDetailsUpdate,
    sendPSAJobBerthUpdate,
    sendDriverAssignmentNotifications,
    sendDriverAssignmentReminders
}