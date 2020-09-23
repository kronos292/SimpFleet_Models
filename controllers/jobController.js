const moment = require('moment');
const _ = require('lodash');

const {Job, UserCompany} = require('../util/models');

async function dateTimeFormatter(date) {
    return moment.tz(date, "Asia/Singapore").format('MMMM DD YYYY, HH:mm');
}

async function find(findMethod, params) {
    return await Job[findMethod](params).populate({
        path: 'vessel',
        model: 'vessels'
    }).populate({
        path: 'vesselLoadingLocation',
        model: 'vesselLoadingLocations',
        populate: {
            path: 'location',
            model: 'locations'
        }
    }).populate({
        path: 'user',
        model: 'users',
        populate: {
            path: 'userCompany',
            model: 'userCompanies'
        }
    }).populate({
        path: 'jobTrackers',
        model: 'jobTrackers'
    }).populate({
        path: 'paymentTrackers',
        model: 'paymentTrackers'
    }).populate({
        path: 'pickupDetails',
        model: 'pickupDetails',
        populate: [
            {
                path: 'pickupLocation',
                model: 'pickupLocations'
            }
        ]
    }).populate({
        path: 'offlandDetails',
        model: 'offlandDetails',
        populate: [
            {
                path: 'offlandLocation',
                model: 'offlandLocations'
            }
        ]
    }).populate({
        path: 'careOffParties',
        model: 'careOffParties',
        populate: [
            {
                path: 'job',
                model: 'jobs'
            }
        ]
    }).populate({
        path: 'jobItems',
        model: 'jobItems'
    }).populate({
        path: 'jobOfflandItems',
        model: 'jobOfflandItems'
    }).populate({
        path: 'jobAdditionalItems',
        model: 'jobAdditionalItems'
    }).populate({
        path: 'jobTrip',
        model: 'jobTrips',
        populate: {
            path: 'driver',
            model: 'transportUsers',
            populate: {
                path: 'company',
                model: 'logisticsCompanies'
            }
        }
    }).populate({
        path: 'estimatedJobPricingBreakdowns',
        model: 'jobPricingBreakdowns'
    }).populate({
        path: 'vesselAnchorageLocation',
        model: 'sgAnchorageLocations'
    }).select();
}

async function buildJobNotification(job) {
    const vessel = job.vessel;

    const vesselLoadingDateTime = (job.vesselLoadingDateTime !== "" && job.vesselLoadingDateTime !== null) ? await dateTimeFormatter(new Date(job.vesselLoadingDateTime)) : "";
    const psaBerthingDateTime = (job.psaBerthingDateTime !== "" && job.psaBerthingDateTime !== null) ? await dateTimeFormatter(new Date(job.psaBerthingDateTime)): "";
    const psaUnberthingDateTime = (job.psaUnberthingDateTime !== "" && job.psaUnberthingDateTime !== null) ? await dateTimeFormatter(new Date(job.psaUnberthingDateTime)) : "";
    const {psaQuayCraneSequence} = vessel && vessel.psaVessel? vessel.psaVessel: null;

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

    const jobAdditionalItems = job.jobAdditionalItems;
    let jobAdditionalItemString = jobAdditionalItems.length > 0 ? `${jobAdditionalItems[0].quantity} ${jobAdditionalItems[0].uom}` : '';
    for (let i = 1; i < jobAdditionalItems.length; i++) {
        const jobAdditionalItem = jobAdditionalItems[i];
        jobAdditionalItemString += `, ${jobAdditionalItem.quantity} ${jobAdditionalItem.uom}`
    }

    const userCompany = await UserCompany.findOne({_id: job.user.userCompany}).select();

    const notifications = [
        {
            key: 'Job ID',
            value: job.index
        },
        {
            key: 'Job Number',
            value: job.jobId
        }
    ];

    // Services Required.
    const services = job.services;
    if(services && services.length > 0) {
        notifications.push(
            {
                key: 'Services Required',
                value: services.map((service, index) => {
                    return `${service.label}, `
                })
            }
        );
    }

    // User Company
    if(userCompany) {
        notifications.push(
            {
                key: 'Company',
                value: userCompany.name
            }
        );
    }

    // Vessel details.
    if(vessel) {
        notifications.push(
            {
                key: 'Vessel Name',
                value: vessel.vesselName
            },
            {
                key: 'Vessel IMO',
                value: vessel.vesselIMOID
            },
            {
                key: 'Vessel Callsign',
                value: vessel.vesselCallsign
            }
        );
    }

    // Delivery Items.
    if(itemString !== '') {
        notifications.push(
            {
                key: 'Items to Deliver',
                value: itemString
            }
        );
    }

    // Offland Items.
    if(jobOfflandItemString !== '') {
        notifications.push(
            {
                key: 'Items to Offland',
                value: jobOfflandItemString
            }
        );
    }

    // Additional Items.
    if(jobAdditionalItemString !== '') {
        notifications.push(
            {
                key: 'Additional Items',
                value: jobAdditionalItemString
            }
        );
    }

    // Delivery Details.
    if (job.vesselLoadingLocation.type === 'port') {
        notifications.push(
            {
                key: 'Delivery Location',
                value: job.vesselLoadingLocation.name
            }
        );
        if (job.psaBerf !== '') {
            notifications.push(
                {
                    key: 'Berth',
                    value: job.psaBerf
                }
            );
        }
        if (job.psaBerthingDateTime !== "" && job.psaBerthingDateTime !== null) {
            notifications.push(
                {
                    key: 'Vessel Estimated Berthing Time',
                    value: psaBerthingDateTime
                }
            );
        }
        if (psaQuayCraneSequence && psaQuayCraneSequence.seqTimeFrom) {
            notifications.push(
                {
                    key: 'Quay Crane Sequence Start',
                    value: psaQuayCraneSequence.seqTimeFrom
                }
            );
        }
        if (psaQuayCraneSequence && psaQuayCraneSequence.seqTimeTo) {
            notifications.push(
                {
                    key: 'Quay Crane Sequence End',
                    value: psaQuayCraneSequence.seqTimeTo
                }
            );
        }
        if (job.psaUnberthingDateTime !== "" && job.psaUnberthingDateTime !== null) {
            notifications.push(
                {
                    key: 'Vessel Estimated Unberthing Time',
                    value: psaUnberthingDateTime
                }
            );
        }
    } else if (job.vesselLoadingLocation.type === 'anchorage') {
        notifications.push(
            {
                key: 'Delivery Location',
                value: job.vesselLoadingLocation.name
            }
        );
        if(job.vesselAnchorageLocation) {
            notifications.push(
                {
                    key: 'Anchorage Name',
                    value: job.vesselAnchorageLocation.name
                },
                {
                    key: 'Anchorage Code',
                    value: job.vesselAnchorageLocation.code
                }
            );
        }
        if (job.vesselLighterName !== "") {
            notifications.push(
                {
                    key: 'Vessel Lighter Name',
                    value: job.vesselLighterName
                }
            );
        }
        if (job.vesselLighterCompany && job.vesselLighterCompany !== "") {
            notifications.push(
                {
                    key: 'Vessel Lighter Company',
                    value: job.vesselLighterCompany
                }
            );
        }
        if (job.vesselLighterRemarks !== "") {
            notifications.push(
                {
                    key: 'Vessel Lighter Remarks',
                    value: job.vesselLighterRemarks
                }
            );
        }
        if (job.vesselLoadingDateTime && job.vesselLoadingDateTime !== "") {
            notifications.push(
                {
                    key: 'Delivery Date & Time',
                    value: vesselLoadingDateTime
                }
            );
        }
    } else if (job.vesselLoadingLocation.type === 'others') {
        notifications.push(
            {
                key: 'Delivery Location',
                value: job.otherVesselLoadingLocation
            }
        );
        if (job.vesselLoadingDateTime && job.vesselLoadingDateTime !== "") {
            notifications.push(
                {
                    key: 'Delivery Date & Time',
                    value: vesselLoadingDateTime
                }
            );
        }
    } else {
        notifications.push(
            {
                key: 'Delivery Location',
                value: job.vesselLoadingLocation.name
            }
        );
        if (job.vesselLoadingDateTime && job.vesselLoadingDateTime !== "") {
            notifications.push(
                {
                    key: 'Delivery Date & Time',
                    value: vesselLoadingDateTime
                }
            );
        }
    }

    // DSA creation.
    if (job.createDSA) {
        notifications.push(
            {
                key: 'Create DSA/SSN',
                value: 'Yes'
            }
        );
    }

    // DSA creation.
    if (job.createOfflandPermit) {
        notifications.push(
            {
                key: 'Create Offland Permit',
                value: 'Yes'
            }
        );
    }

    // Dangerous Goods.
    notifications.push(
        {
            key: 'Goods contain DG Items',
            value: job.hasDGItems? 'Yes': 'No'
        }
    );

    // Boarding officer.
    notifications.push(
        {
            key: 'Boarding Officer',
            value: job.hasBoarding? 'Boarding Officer will be provided for this job.': 'There will be no Boarding Officer for this job.'
        }
    );
    if(job.hasBoarding && job.boardingName !== '') {
        notifications.push(
            {
                key: 'Boarding Officer Name',
                value: job.boardingName
            }
        );
    }
    if(job.hasBoarding && job.boardingContact !== '') {
        notifications.push(
            {
                key: 'Boarding Officer Contact',
                value: job.boardingContact
            }
        );
    }

    // Job PIC.
    if(job.jobPICName !== '') {
        notifications.push(
            {
                key: 'PIC Name',
                value: job.jobPICName
            }
        );
    }
    if(job.jobPICContact !== '') {
        notifications.push(
            {
                key: 'PIC Contact',
                value: job.jobPICContact
            }
        );
    }

    // Job pickup.
    if (job.pickupDetails.length > 0) {
        let messageString = '\n';
        for (let i = 0; i < job.pickupDetails.length; i++) {
            const pickUpDateTime = await dateTimeFormatter(new Date(job.pickupDetails[i].pickupDateTime));
            messageString += `${pickUpDateTime} - ${job.pickupDetails[i].pickupLocation.addressString}\n`;
        }
        notifications.push(
            {
                key: 'Pick up from the following locations',
                value: messageString
            }
        );
    }

    // Remarks.
    if (job.remarks && job.remarks !== "") {
        const remarksArray = job.remarks.split("\n");
        let messageString = '\n';
        for (let i = 0; i < remarksArray.length; i++) {
            messageString += `${remarksArray[i]}\n`;
        }

        notifications.push(
            {
                key: 'Remarks',
                value: messageString
            }
        );
    }

    return notifications;
}

async function checkJobCompletion(job) {
    const {version, jobTrackers} = job;

    if(version === 2) {
        const jobTracker = _.find(jobTrackers, ['type', 'END']);
        return jobTracker.isCompleted;
    } else {
        return jobTrackers.length >= 6;
    }
}

module.exports = {
    find,
    buildJobNotification,
    checkJobCompletion
};