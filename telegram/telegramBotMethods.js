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

async function formJobMessage(job, status) {
    const heading = status === "Update" ? 'Job Update' : 'New job';

    const vessel = job.vessel;

    const vesselLoadingDateTime = (job.vesselLoadingDateTime !== "" && job.vesselLoadingDateTime !== null) ? await dateTimeFormatter(new Date(job.vesselLoadingDateTime)) : "";
    const psaBerthingDateTime = (job.psaBerthingDateTime !== "" && job.psaBerthingDateTime !== null) ? await dateTimeFormatter(new Date(job.psaBerthingDateTime)): "";
    const psaUnberthingDateTime = (job.psaUnberthingDateTime !== "" && job.psaUnberthingDateTime !== null) ? await dateTimeFormatter(new Date(job.psaUnberthingDateTime)) : "";


    const items = job.jobItems;
    let itemString = items.length > 0 ? `${items[0].quantity} ${items[0].uom}` : '';
    for (let i = 1; i < items.length; i++) {
        const item = items[i];
        itemString += `, ${item.quantity} ${item.uom}`
    }

    const jobOfflandItems = job.jobOfflandItems;
    let jobOfflandItemString = jobOfflandItems.length > 0 ? `${jobOfflandItems[0].quantity} ${jobOfflandItems[0].uom}` : '';
    for (let i = 1; i < jobOfflandItems.length; i++) {
        const jobOfflandItem = jobOfflandItems[i];
        jobOfflandItemString += `, ${jobOfflandItem.quantity} ${jobOfflandItem.uom}`
    }

    const userCompany = await UserCompany.findOne({_id: job.user.userCompany}).select();

    let messageString = `${heading} for ${job.index}: \n\n`;
    messageString += `Job ID: ${job.index}\n`;
    messageString += `Job Number: ${job.jobId}\n`;
    if (userCompany !== null) {
        messageString += `Company: ${userCompany.name}\n`;
    }
    if (vessel !== null) {
        messageString += `Vessel Name: ${vessel.vesselName}\n`;
        messageString += `Vessel IMO: ${vessel.vesselIMOID}\n`;
        messageString += `Vessel Callsign: ${vessel.vesselCallsign}\n`;
    }
    messageString += `Items to Deliver: ${itemString}\n`;
    if (jobOfflandItemString !== "") {
        messageString += `Items to Offland: ${jobOfflandItemString}\n`;
    }
    if (job.vesselLoadingLocation.type === 'port') {
        messageString += `Vessel Loading Location: ${job.vesselLoadingLocation.name}\n`;
        if (job.psaBerf !== '') {
            messageString += `Berth: ${job.psaBerf}\n`;
        }
        if (job.psaBerthingDateTime !== "" && job.psaBerthingDateTime !== null) {
            messageString += `Vessel Estimated Berthing Time: ${psaBerthingDateTime}\n`;
        }
        if (job.psaUnberthingDateTime !== "" && job.psaUnberthingDateTime !== null) {
            messageString += `Vessel Estimated Unberthing Time: ${psaUnberthingDateTime}\n`;
        }
    } else if (job.vesselLoadingLocation.type === 'anchorage') {
        messageString += `Vessel Loading Location: ${job.vesselLoadingLocation.name}\n`;
        if (job.vesselLighterName !== "") {
            messageString += `Vessel Lighter Name: ${job.vesselLighterName}\n`;
        }
        if (job.vesselLighterRemarks !== "") {
            messageString += `Vessel Lighter Remarks: ${job.vesselLighterRemarks}\n`;
        }
        if (job.vesselLoadingDateTime !== "") {
            messageString += `Lighter Loading Date & Time: ${vesselLoadingDateTime}\n`;
        }
    } else if (job.vesselLoadingLocation.type === 'others') {
        messageString += `Vessel Loading Location: ${job.otherVesselLoadingLocation}\n`;
        if (job.vesselLoadingDateTime !== "") {
            messageString += `Vessel Loading Date & Time: ${vesselLoadingDateTime}\n`;
        }
    } else {
        messageString += `Vessel Loading Location: ${job.vesselLoadingLocation.name}\n`;
        if (job.vesselLoadingDateTime !== "") {
            messageString += `Vessel Loading Date & Time: ${vesselLoadingDateTime}\n`;
        }
    }
    if (job.createDSA) {
        messageString += `A DSA is to be created for the Job Items.\n`;
    }
    if (job.hasBoarding) {
        messageString += `\nBoarding Officer will be provided for this job.\n`;
    } else {
        messageString += `\nThere will be no Boarding Officer for this job.\n`;
    }
    messageString += '\n';
    if (job.pickup) {
        messageString += `Pick up from the following locations:\n`;
        for (let i = 0; i < job.pickupDetails.length; i++) {
            const pickUpDateTime = await dateTimeFormatter(new Date(job.pickupDetails[i].pickupDateTime));
            messageString += `${pickUpDateTime} - ${job.pickupDetails[i].pickupLocation.addressString}\n`;
        }
    }
    messageString += '\n';
    if (job.remarks !== "") {
        messageString += `Remarks:\n`;
        const remarksArray = job.remarks.split("\n");
        for (let i = 0; i < remarksArray.length; i++) {
            messageString += `${remarksArray[i]}\n`;
        }
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

async function sendAdminJobBookingInfo(job) {
    const jobDetails = await formJobMessage(job, "Create");

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

async function sendAdminJobUpdateInfo(job) {
    const jobDetails = await formJobMessage(job, "Update");

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
    const transporterGPSTracking = new TransporterGPSTracking({
        user,
        jobTrip,
        startDateTime: new Date()
    });

    const transporterGPSLocation = await TransporterGPSLocation.findOne({user: user._id}).sort({timestamp: -1}).select();
    console.log(transporterGPSLocation);
    if(transporterGPSLocation) {
        const {lat, lng} = transporterGPSLocation;

        const message = await api.sendLocation({
            chat_id: keys.SIMPFLEET_TRANSPORT_TRACKING_CHAT_ID,
            latitude: lat,
            longitude: lng,
            live_period: 86400
        });
        transporterGPSTracking.telegramMessageId = message.message_id;
    }
    await transporterGPSTracking.save();
}

// Update driver's live location to admin telegram chat.
async function updateTransportLiveLocation(transporterGPSTracking) {
    const {user, telegramMessageId} = transporterGPSTracking;
    const transporterGPSLocation = await TransporterGPSLocation.findOne({user: user._id}).sort({timestamp: -1}).select();

    if(transporterGPSLocation) {
        const {lat, lng} = transporterGPSLocation;

        await api.editMessageLiveLocation({
            chat_id: keys.SIMPFLEET_TRANSPORT_TRACKING_CHAT_ID,
            latitude: lat,
            longitude: lng,
            live_period: 86400,
            message_id: telegramMessageId
        });
    }
}

module.exports = {
    sendJobBookingInfo: async (job) => {
        const jobDetails = await formJobMessage(job, "Create");

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
    sendJobBookingUpdateInfo: async (job) => {
        const jobDetails = await formJobMessage(job, "Update");

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
    updateTransportLiveLocation
};
