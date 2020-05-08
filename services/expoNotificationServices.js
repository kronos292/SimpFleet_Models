const axios = require('axios');
const moment = require('moment');

const {LogisticsUser, LogisticsCompany, ExpoPushNotification, JobRequest, JobAssignment} = require('../util/models');

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

// Send expo notifications via server.
async function sendExpoNotifications(expoPushNotifications, title, body, data) {
    for(let i = 0; i < expoPushNotifications.length; i++) {
        const expoPushNotification = expoPushNotifications[i];
        const {expoPushNotificationToken} = expoPushNotification;
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

async function sendJobRequestNotifications(job) {
    // Get Logistics companies and get all expo tokens.
    const logisticsCompanies = await LogisticsCompany.find().select();

    const jobRequests = [];
    for(let i = 0; i < logisticsCompanies.length; i++) {
        const logisticsCompany = logisticsCompanies[i];

        // Get logistics users of the company. Check if they have Expo push notifications.
        const expoPushNotifications = await getExpoTokensOfLogisticsCompany(logisticsCompany);

        // Send job requests only if expo tokens can be found.
        if(expoPushNotifications.length > 0) {
            const jobRequest = new JobRequest({
                job: job._id,
                logisticsCompany: logisticsCompany._id,
                expoPushNotifications,
                status: 'PENDING'
            });
            await jobRequest.save();
            jobRequests.push(jobRequest);
        }
    }

    // Send only if expo tokens can be found.
    if(jobRequests.length > 0) {
        for(let i = 0; i < jobRequests.length; i++) {
            const jobRequest = jobRequests[i];
            const {expoPushNotifications} = jobRequest;

            // Set notification details.
            const title = `New Job Request`;
            let {pickupDetails, index, vesselLoadingLocation} = job;
            let body = `New job ${index}. Delivery to ${vesselLoadingLocation.name}.`;
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
            let {pickupDetails, index, vesselLoadingLocation} = job;
            let body = `New job ${index} has been assigned to you. Delivery to ${vesselLoadingLocation.name}.`;
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
    const jobAssignment = await JobAssignment.findOne({job: job._id}).populate({
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

module.exports = {
    sendJobRequestNotifications,
    sendJobAssignmentNotifications,
    sendJobDetailsUpdate
}