const telegram = require('telegram-bot-api');
const moment = require('moment-timezone');
const axios = require('axios');

const keys = require('../../../config/keys');

const JobAssignment = require('../models/JobAssignment');
const Location = require('../models/Location');
const PSABerth = require('../models/PSABerth');
const LogisticsCompany = require('../models/LogisticsCompany');
const UserCompany = require('../models/UserCompany');
const PSAVessel = require('../models/PSAVessel');
const Invoice = require('../models/accounts/Invoice');
const TransporterGPSLocation = require('../models/TransporterGPSLocation');
const TransporterGPSTracking = require('../models/TransporterGPSTracking');
const Job = require('../models/Job');
const {jobTripController, jobController} = require('../util/controllers');

const api = new telegram({
    token: keys.SIMPFLEET_TELEGRAM_BOT_TOKEN
});

async function dateTimeFormatter(date) {
    return moment.tz(date, "Asia/Singapore").format('MMMM DD YYYY, HH:mm');
    // return moment.tz(date, "Pacific/Galapagos").format('MMMM DD YYYY, HH:mm');
}

async function qcDateTimeParser(dateTimeString) {
    const day = Number(dateTimeString.split(" ")[0].split("/")[0]);
    const month = Number(dateTimeString.split(" ")[0].split("/")[1]);
    const year = Number(dateTimeString.split(" ")[0].split("/")[2]);
    const hour = Number(dateTimeString.split(" ")[1].split(":")[0]);
    const minutes = Number(dateTimeString.split(" ")[1].split(":")[1]);
    const seconds = Number(dateTimeString.split(" ")[1].split(":")[2]);
    return new Date(`${year}-${month}-${day} ${hour}:${minutes}:${seconds} GMT+08:00`);
}

async function formJobMessage(job, notificationArr, status) {
    const heading = status === "Update" ? 'Job Update' : 'New job';

    let messageString = `${heading} for ${job.index}: \n\n`;
    for(let i = 0; i < notificationArr.length; i++) {
        const notification = notificationArr[i];
        const {key, value} = notification;
        messageString += `${key}: ${value}\n`;
    }

    return messageString;
}

async function documentCreationMessage(jobFile, job) {
    const {numCopies, requirements, remarks} = jobFile;
    let text = `A new document has been created for job ${job.jobId}\n\n`;
    let needPrintCopy = false;
    for (let i = 0; i < requirements.length; i++) {
        const requirement = requirements[i];
        const {key, check} = requirement;
        if (key === "needPrintCopy" && check) {
            needPrintCopy = true;
            text += `Please help to print ${numCopies} copies.\n`;
        } else if (key === "signAndReturn" && check) {
            text += `The document needs to be signed and returned.\n`;
        }
    }
    if (remarks !== 'NIL') {
        text += 'Remarks: ' + remarks + '\n';
    }

    // Get job assignment and logistics company
    const jobAssignment = await JobAssignment.findOne({job: job._id}).populate({
        path: 'logisticsCompany',
        model: 'logisticsCompanies'
    }).select();
    const {logisticsCompany} = jobAssignment;

    const message = await api.sendMessage({
        chat_id: logisticsCompany.telegramGroupChatId,
        text
    });
    if (needPrintCopy) {
        await api.sendDocument({
            chat_id: logisticsCompany.telegramGroupChatId,
            document: jobFile.fileURL,
            reply_to_message_id: message.message_id
        });
    }
}

async function jobCancellationConfirmation(job) {
    // Get job assignment and logistics company
    const jobAssignment = await JobAssignment.findOne({job: job._id}).populate({
        path: 'logisticsCompany',
        model: 'logisticsCompanies'
    }).select();
    const {logisticsCompany} = jobAssignment;

    let text = `Please note that Job ${job.jobId} has been cancelled.`;

    await api.sendMessage({
        chat_id: logisticsCompany.telegramGroupChatId,
        text
    });
}

async function sendLocation(job, message) {
    // Send vessel loading location
    let location = null;
    if (job.vesselLoadingLocation.type === 'anchorage') {
        location = await Location.findOne({name: job.vesselLighterLocation}).select();
    } else if (job.vesselLoadingLocation.type === 'port') {
        const {psaBerf} = job;
        const psaBerth = await PSABerth.findOne({berth: psaBerf}).populate({
            path: 'location',
            model: 'locations'
        }).select();
        location = psaBerth !== null ? psaBerth.location : null;
    }

    if (location !== null) {
        await api.sendLocation({
            chat_id: keys.SIMPFLEET_TELEGRAM_CHAT_ID,
            longitude: location.lng,
            latitude: location.lat,
            reply_to_message_id: message.message_id
        });
    }
}

async function sendAdminJobBookingInfo(job, notificationArr) {
    const jobDetails = await formJobMessage(job, notificationArr, "Create");

    try {
        const keyboardButtons = [];
        const logisticsCompanies = await LogisticsCompany.find().select();
        for (let i = 0; i < logisticsCompanies.length; i++) {
            const logisticsCompany = logisticsCompanies[i];
            keyboardButtons.push({
                text: logisticsCompany.name,
                callback_data: `job_assignment ${logisticsCompany._id} ${job._id}`
            });
        }

        const res = await axios.post(`https://api.telegram.org/bot${keys.SIMPFLEET_TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: keys.SIMPFLEET_TELEGRAM_CHAT_ID,
            text: jobDetails,
            reply_markup: {
                "inline_keyboard": [keyboardButtons]
            }
        });
        const message = res.data.result;

        // Send vessel loading location
        await sendLocation(job, message);
    } catch (err) {
        console.log(err);
    }
}

async function sendAdminJobUpdateInfo(job, notificationArr) {
    const jobDetails = await formJobMessage(job, notificationArr,"Update");

    try {
        const message = await api.sendMessage({
            chat_id: keys.SIMPFLEET_TELEGRAM_CHAT_ID,
            text: jobDetails
        });

        // Send vessel loading location
        await sendLocation(job, message);
    } catch (err) {
        console.log(err);
    }
}

async function sendUserJobUpdateInfo(job, notificationArr) {
    const jobDetails = await formJobMessage(job, notificationArr,"Update");
    const {user} = job;
    const {userCompany} = user;

    if(userCompany) {
        try {
            await api.sendMessage({
                chat_id: userCompany.telegramGroupChatId,
                text: jobDetails
            });
        } catch (err) {
            console.log(err);
        }
    }
}

async function sendUserJobTrackerUpdateInfo(jobObj, jobTracker) {
    const job = await jobController.find('findOne', {_id: jobObj._id});
    const {user, index, vessel} = job;
    const {userCompany} = user;

    if(userCompany) {
        let text = `Job Update for ${index}:\n\n`;
        if(vessel) {
            text += `Vessel: ${vessel.vesselName}\n`;
        }
        text += `Status: ${jobTracker.title}\n`;

        try {
            await api.sendMessage({
                chat_id: userCompany.telegramGroupChatId,
                text
            });
        } catch (err) {
            console.log(err);
        }
    }
}

async function jobBerthTimingUpdate(job) {
    const {vessel} = job;

    let messageString = `Updated vessel berth info for ${job.index}: \n\n`;
    messageString += `Job Number: ${job.jobId}\n`;
    messageString += `Company: ${job.user.userCompany.name}\n`;
    messageString += `Vessel: ${vessel.vesselName}\n`;
    messageString += `Berthing Time: ${await dateTimeFormatter(new Date(job.psaBerthingDateTime))}\n`;
    messageString += `Unberthing Time: ${await dateTimeFormatter(new Date(job.psaUnberthingDateTime))}\n`;
    messageString += `Berf: ${job.psaBerf}\n`;

    await api.sendMessage({
        chat_id: keys.SIMPFLEET_TELEGRAM_BROADCAST_CHAT_ID,
        text: messageString
    });
}

async function jobBerthQCAdminUpdate(vessels) {
    if (vessels.length > 0) {
        let text = 'PSA Quay Crane Sequence Update: \n\n';
        for (let i = 0; i < vessels.length; i++) {
            const vessel = vessels[i];

            text += `${vessel['Vessel Name']}: From ${await dateTimeFormatter(await qcDateTimeParser(vessel['QC Seq Time From']))} to ${await dateTimeFormatter(await qcDateTimeParser(vessel['QC Seq Time To']))}. \n`;
        }

        await api.sendMessage({
            chat_id: keys.SIMPFLEET_TELEGRAM_BROADCAST_CHAT_ID,
            text
        });
    }
}

async function sendLighterBerthCallArrivalInformation(jpLighterBerthCall) {
    const {lighterName, lighterNumber, terminal, arrivalDateTime, crane, companyName} = jpLighterBerthCall;
    if (lighterName && lighterName !== '') {
        let text = 'JP Lighter Arrival Update: \n\n'
            + `Terminal: ${terminal === 'msw' ? 'Marina South Wharves' : 'Penjuru Terminal'}\n`
            + `Lighter Name: ${lighterName}\n`
            + `Lighter Number: ${lighterNumber}\n`
            + `Company Name: ${companyName}\n`
            + `Crane: ${crane}\n`
            + `Arrival DateTime: ${moment.tz(new Date(arrivalDateTime), "Asia/Singapore").format('MMM DD YYYY HH:mm')}\n`;

        await api.sendMessage({
            chat_id: keys.SIMPFLEET_TELEGRAM_BROADCAST_CHAT_ID,
            text
        });
    }
}

async function sendLighterBerthCallDepartureInformation(jpLighterBerthCall) {
    const {lighterName, lighterNumber, terminal, arrivalDateTime, departureDateTime, crane, companyName} = jpLighterBerthCall;
    if (lighterName && lighterName !== '') {
        let text = 'JP Lighter Departure Update: \n\n'
            + `Terminal: ${terminal === 'msw' ? 'Marina South Wharves' : 'Penjuru Terminal'}\n`
            + `Lighter Name: ${lighterName}\n`
            + `Lighter Number: ${lighterNumber}\n`
            + `Company Name: ${companyName}\n`
            + `Crane: ${crane}\n`
            + `Arrival DateTime: ${moment.tz(new Date(arrivalDateTime), "Asia/Singapore").format('MMM DD YYYY HH:mm')}\n`
            + `Departure DateTime: ${moment.tz(new Date(departureDateTime), "Asia/Singapore").format('MMM DD YYYY HH:mm')}\n`;

        await api.sendMessage({
            chat_id: keys.SIMPFLEET_TELEGRAM_BROADCAST_CHAT_ID,
            text
        });
    }
}

async function sendInvoiceFile(invoice) {
    const {fileURL, status} = invoice;

    let text = 'A draft invoice has been created.';
    if(status === "Authorised") {
        text = 'Approved invoice has been sent out via email to the customer.'
    }

    const message = await api.sendMessage({
        chat_id: keys.SIMPFLEET_ACCOUNTS_TELEGRAM_CHAT_ID,
        text
    });
    await api.sendDocument({
        chat_id: keys.SIMPFLEET_ACCOUNTS_TELEGRAM_CHAT_ID,
        document: fileURL,
        reply_to_message_id: message.message_id
    });
}

async function sendErrorLogs(err) {
    await api.sendMessage({
        chat_id: keys.SIMPFLEET_TELEGRAM_ERROR_LOG_CHAT_ID,
        text: err.toString()
    });
}

// Send driver's live location to admin telegram chat.
async function sendTransportLiveLocation(user, jobTrip) {
    let transporterGPSTracking = await TransporterGPSTracking.findOne({user: user._id, jobTrip: jobTrip._id}).select();
    if(!transporterGPSTracking) {
        transporterGPSTracking = new TransporterGPSTracking({
            user,
            jobTrip,
            startDateTime: new Date()
        });

        const transporterGPSLocation = await TransporterGPSLocation.findOne({user: user._id}).sort({timestamp: -1}).select();
        if(transporterGPSLocation) {
            const {lat, lng} = transporterGPSLocation;

            try {
                const text = `All items for Job Trip ${jobTrip.id} have been picked up/Received. Live Tracking of delivery will now commence.`;
                let message = await api.sendMessage({
                    chat_id: keys.SIMPFLEET_TRANSPORT_TRACKING_CHAT_ID,
                    text
                });
                message = await api.sendLocation({
                    chat_id: keys.SIMPFLEET_TRANSPORT_TRACKING_CHAT_ID,
                    latitude: lat,
                    longitude: lng,
                    live_period: 86400,
                    reply_to_message_id: message.message_id
                });
                transporterGPSTracking.telegramMessageId = message.message_id;
            } catch(err) {
                console.log(err);
            }
        }
        await transporterGPSTracking.save();
    }
}

// Update driver's live location to admin telegram chat.
async function updateTransportLiveLocation(transporterGPSTracking) {
    const {user, jobTrip, telegramMessageId} = transporterGPSTracking;
    const transporterGPSLocation = await TransporterGPSLocation.findOne({user: user._id}).sort({timestamp: -1}).select();

    if(transporterGPSLocation) {
        const {lat, lng} = transporterGPSLocation;

        // Send updated location message and location.
        try {
            const text = `All items for Job Trip ${jobTrip.id} are currently on the way to delivery location.`;
            let message = await api.sendMessage({
                chat_id: keys.SIMPFLEET_TRANSPORT_TRACKING_CHAT_ID,
                text
            });
            message = await api.sendLocation({
                chat_id: keys.SIMPFLEET_TRANSPORT_TRACKING_CHAT_ID,
                latitude: lat,
                longitude: lng,
                live_period: 86400,
                reply_to_message_id: message.message_id
            });
            transporterGPSTracking.telegramMessageId = message.message_id;
            await transporterGPSTracking.save();
        } catch(err) {
            console.log(err);
        }
    }
}

// Stop driver's live location to admin telegram chat.
async function stopTransportLiveLocation(transporterGPSTracking) {
    const {telegramMessageId} = transporterGPSTracking;

    try {
        await axios.post(`https://api.telegram.org/bot${keys.SIMPFLEET_TELEGRAM_BOT_TOKEN}/stopMessageLiveLocation`, {
            chat_id: keys.SIMPFLEET_TRANSPORT_TRACKING_CHAT_ID,
            message_id: telegramMessageId
        });
    } catch(err) {
        console.log(err);
    }
}

async function sendJobProgressReport() {
    const dateNow = new Date();
    const weekJobs = await Job.find({jobBookingDateTime: {"$gte": moment(dateNow).subtract(6, 'days'), "$lt": dateNow}}).select();
    const lastWeekJobs = await Job.find({jobBookingDateTime: {"$gte": moment(dateNow).subtract(13, 'days'), "$lt": moment(dateNow).subtract(7, 'days')}}).select();

    const monthJobs = await Job.find({jobBookingDateTime: {"$gte": moment(new Date(dateNow.getFullYear(), dateNow.getMonth(), 1)), "$lt": moment(dateNow)}}).select();
    const lastMonthJobs = await Job.find({jobBookingDateTime: {"$gte": moment(new Date(dateNow.getFullYear(), dateNow.getMonth(), 1)).subtract(1, 'month'), "$lt": moment(new Date(dateNow.getFullYear(), dateNow.getMonth(), 31)).subtract(1, 'month')}}).select();

    let text = `Job progress update:\n\n`
    + `No. of jobs this week: ${weekJobs.length}\n`
     + `Compared to last week, ${weekJobs.length - lastWeekJobs.length > 0? 'increase': 'decrease'} by: ${weekJobs.length - lastWeekJobs.length}\n`
     + `\n`
    + `No. of jobs so far this month: ${monthJobs.length}\n`
    + `Compared to last month, ${monthJobs.length - lastMonthJobs.length > 0? 'increase': 'decrease'} by: ${monthJobs.length - lastMonthJobs.length}\n`;

    await api.sendMessage({
        chat_id: keys.SIMPFLEET_TELEGRAM_CHAT_ID,
        text
    });
}

async function sendDriverAssignmentNotification(jobTrip) {
    jobTrip = await jobTripController.find('findOne', {_id: jobTrip._id});
    const {driver, jobs} = jobTrip;

    let text = `${driver.firstName} ${driver.lastName} has been assigned to Job Trip ${jobTrip.id}. Jobs involved:\n\n`;
    for(let i = 0; i < jobs.length; i++) {
        const job = jobs[i];

        text += `${i + 1}) ${job.index}`;
        text += '\n';
    }

    await api.sendMessage({
        chat_id: keys.SIMPFLEET_TELEGRAM_BROADCAST_CHAT_ID,
        text
    });
}

async function sendUserDriverAssignmentNotification(jobTrip) {
    jobTrip = await jobTripController.find('findOne', {_id: jobTrip._id});
    const {driver, jobs} = jobTrip;

    for(let i = 0; i < jobs.length; i++) {
        const job = await jobController.find('findOne', {_id: jobs[i]._id});
        const {user, vessel, jobId} = job;
        const {vesselName} = vessel;
        const {userCompany} = user;

        let text = `Driver has been assigned to job ${job.index}:\n\n`;
        text += `Driver Name: ${driver.firstName} ${driver.lastName}\n`;
        text += `Driver Contact No.: ${driver.contactNumber}\n`;
        text += `Job Number: ${jobId}\n`;
        text += `Vessel: ${vesselName}\n`;

        await api.sendMessage({
            chat_id: userCompany.telegramGroupChatId,
            text
        });
    }
}

module.exports = {
    sendJobBookingInfo: async (job, notificationArr) => {
        const jobDetails = await formJobMessage(job, notificationArr, "Create");

        // Get job assignment and logistics company
        const jobAssignment = await JobAssignment.findOne({job: job._id}).populate({
            path: 'logisticsCompany',
            model: 'logisticsCompanies'
        }).select();
        const {logisticsCompany} = jobAssignment;

        // Send job details to company designated group chat
        try {
            if(logisticsCompany && logisticsCompany.telegramGroupChatId.trim() !== '') {
                await api.sendMessage({
                    chat_id: logisticsCompany.telegramGroupChatId,
                    text: jobDetails
                });
            }
        } catch(err) {
            console.log(err);
        }

        // Get user company and send to company group chat.
        try {
            const {userCompany} = job.user;
            if(userCompany && userCompany.telegramGroupChatId && userCompany.telegramGroupChatId.trim() !== '') {
                await api.sendMessage({
                    chat_id: userCompany.telegramGroupChatId,
                    text: jobDetails
                });
            }
        } catch(err) {
            console.log(err);
        }
    },
    sendJobBookingUpdateInfo: async (job, notificationArr) => {
        const jobDetails = await formJobMessage(job, notificationArr, "Update");

        // Get job assignment and logistics company
        const jobAssignment = await JobAssignment.findOne({job: job._id}).populate({
            path: 'logisticsCompany',
            model: 'logisticsCompanies'
        }).select();
        const {logisticsCompany} = jobAssignment;

        // Send job details to company designated group chat
        try {
            if(logisticsCompany && logisticsCompany.telegramGroupChatId.trim() !== '') {
                await api.sendMessage({
                    chat_id: logisticsCompany.telegramGroupChatId,
                    text: jobDetails
                });
            }
        } catch(err) {
            console.log(err);
        }

        // Get user company and send to company group chat.
        try {
            const {userCompany} = job.user;
            if(userCompany && userCompany.telegramGroupChatId && userCompany.telegramGroupChatId.trim() !== '') {
                await api.sendMessage({
                    chat_id: userCompany.telegramGroupChatId,
                    text: jobDetails
                });
            }
        } catch(err) {
            console.log(err);
        }
    },
    documentCreationMessage,
    jobCancellationConfirmation,
    sendAdminJobBookingInfo,
    sendAdminJobUpdateInfo,
    jobBerthTimingUpdate,
    jobBerthQCAdminUpdate,
    sendLighterBerthCallArrivalInformation,
    sendLighterBerthCallDepartureInformation,
    sendErrorLogs,
    sendInvoiceFile,
    sendTransportLiveLocation,
    updateTransportLiveLocation,
    stopTransportLiveLocation,
    sendJobProgressReport,
    sendDriverAssignmentNotification,
    sendUserJobUpdateInfo,
    sendUserJobTrackerUpdateInfo,
    sendUserDriverAssignmentNotification
};
