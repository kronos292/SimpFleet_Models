const moment = require('moment');
const _ = require('lodash');

const {Job, UserCompany} = require('../util/models');

async function dateTimeFormatter(date) {
    return moment.tz(date, "Asia/Singapore").format('MMMM DD YYYY, HH:mm');
}

async function constructVesselLocationDetails(job, isOfflandOnly) {
    const vesselLoadingDateTime = (job.vesselLoadingDateTime !== "" && job.vesselLoadingDateTime !== null) ? await dateTimeFormatter(new Date(job.vesselLoadingDateTime)) : "";
    const psaBerthingDateTime = (job.psaBerthingDateTime !== "" && job.psaBerthingDateTime !== null) ? await dateTimeFormatter(new Date(job.psaBerthingDateTime)): "";
    const psaUnberthingDateTime = (job.psaUnberthingDateTime !== "" && job.psaUnberthingDateTime !== null) ? await dateTimeFormatter(new Date(job.psaUnberthingDateTime)) : "";

    const vessel = job.vessel;
    let seqTimeFrom = '';
    let seqTimeTo = '';
    if (vessel) {
        const psaQuayCraneSequence = vessel.psaQuayCraneSequence;
        if(psaBerthingDateTime && psaBerthingDateTime !== '' && psaUnberthingDateTime && psaUnberthingDateTime !== '') {
            seqTimeFrom = psaQuayCraneSequence && psaQuayCraneSequence.seqTimeFrom && moment(psaQuayCraneSequence.seqTimeFrom).isAfter(psaBerthingDateTime) && moment(psaQuayCraneSequence.seqTimeFrom).isBefore(psaUnberthingDateTime)? await dateTimeFormatter(psaQuayCraneSequence.seqTimeFrom): '';
            seqTimeTo = psaQuayCraneSequence && psaQuayCraneSequence.seqTimeTo && moment(psaQuayCraneSequence.seqTimeTo).isAfter(psaBerthingDateTime) && moment(psaQuayCraneSequence.seqTimeTo).isBefore(psaUnberthingDateTime)? await dateTimeFormatter(psaQuayCraneSequence.seqTimeTo): '';
        }
    }

    let notifications = [];
    // Delivery Details.
    if (job.vesselLoadingLocation.type === 'port') {
        notifications.push(
            {
                key: isOfflandOnly ? 'Offland from': 'Delivery Location',
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
    if (seqTimeFrom && seqTimeFrom !== '') {
        notifications.push(
            {
                key: 'Quay Crane Sequence Start',
                value: seqTimeFrom
            }
        );
    }
    if (seqTimeTo && seqTimeTo !== '') {
        notifications.push(
            {
                key: 'Quay Crane Sequence End',
                value: seqTimeTo
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
                key: isOfflandOnly ? 'Offland from': 'Delivery Location',
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
        if (job.lighterBoatCompanies && job.lighterBoatCompanies.length > 0) {
            notifications.push(
                {
                    key: 'Vessel Lighter Company',
                    value: job.lighterBoatCompanies[0].companyName
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
                    key: isOfflandOnly ? 'Offland Date & Time' : 'Delivery Date & Time',
                    value: vesselLoadingDateTime
                }
            );
        }
    } else if (job.vesselLoadingLocation.type === 'others') {
        notifications.push(
            {
                key: isOfflandOnly ? 'Offland from': 'Delivery Location',
                value: job.otherVesselLoadingLocationObj.name
            }
        );
        if (job.vesselLoadingDateTime && job.vesselLoadingDateTime !== "") {
            notifications.push(
                {
                    key: isOfflandOnly ? 'Offland Date & Time' : 'Delivery Date & Time',
                    value: vesselLoadingDateTime
                }
            );
        }
    } else {
        notifications.push(
            {
                key: isOfflandOnly ? 'Offland from': 'Delivery Location',
                value: job.vesselLoadingLocation.name
            }
        );
        if (job.vesselLoadingDateTime && job.vesselLoadingDateTime !== "") {
            notifications.push(
                {
                    key: isOfflandOnly ? 'Offland Date & Time' : 'Delivery Date & Time',
                    value: vesselLoadingDateTime
                }
            );
        }
    }

    return notifications.length > 0 ? notifications : null;
}

async function find(findMethod, params) {
    return await Job[findMethod](params).populate({
        path: 'vessel',
        model: 'vessels',
        populate: [
            {
                path: 'psaQuayCraneSequence',
                model: 'psaQuayCraneSequences'
            },
            {
                path: 'psaVessel',
                model: 'psaVessels'
            }
        ]
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
            model: 'userCompanies',
            populate: {
                path: 'productSuites',
                model: 'productSuites'
            }
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
                model: 'pickupLocations',
                populate: [
                    {
                        path: 'location',
                        model: 'locations'
                    }
                ]
            }
        ]
    }).populate({
        path: 'offlandDetails',
        model: 'offlandDetails',
        populate: [
            {
                path: 'offlandLocation',
                model: 'offlandLocations',
                populate: [
                    {
                        path: 'location',
                        model: 'locations'
                    }
                ]
            },
            
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
    }).populate({
        path: 'lighterBoatCompanies',
        model: 'lighterBoatCompanies'
    }).populate({
        path: 'otherVesselLoadingLocationObj',
        model: 'locations'
    }).select();
}

async function buildJobNotification(job) {
    const vesselLoadingDateTime = (job.vesselLoadingDateTime !== "" && job.vesselLoadingDateTime !== null) ? await dateTimeFormatter(new Date(job.vesselLoadingDateTime)) : "";
    const psaBerthingDateTime = (job.psaBerthingDateTime !== "" && job.psaBerthingDateTime !== null) ? await dateTimeFormatter(new Date(job.psaBerthingDateTime)): "";
    const psaUnberthingDateTime = (job.psaUnberthingDateTime !== "" && job.psaUnberthingDateTime !== null) ? await dateTimeFormatter(new Date(job.psaUnberthingDateTime)) : "";

    const vessel = job.vessel;
    let seqTimeFrom = '';
    let seqTimeTo = '';
    if (vessel) {
        const psaQuayCraneSequence = vessel.psaQuayCraneSequence;
        if(psaBerthingDateTime && psaBerthingDateTime !== '' && psaUnberthingDateTime && psaUnberthingDateTime !== '') {
            seqTimeFrom = psaQuayCraneSequence && psaQuayCraneSequence.seqTimeFrom && moment(psaQuayCraneSequence.seqTimeFrom).isAfter(psaBerthingDateTime) && moment(psaQuayCraneSequence.seqTimeFrom).isBefore(psaUnberthingDateTime)? await dateTimeFormatter(psaQuayCraneSequence.seqTimeFrom): '';
            seqTimeTo = psaQuayCraneSequence && psaQuayCraneSequence.seqTimeTo && moment(psaQuayCraneSequence.seqTimeTo).isAfter(psaBerthingDateTime) && moment(psaQuayCraneSequence.seqTimeTo).isBefore(psaUnberthingDateTime)? await dateTimeFormatter(psaQuayCraneSequence.seqTimeTo): '';
        }
    }

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
            key: 'groupHeader',
            value: 'Booking & Vessel Info',
        },
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
                    return `${service.label}`
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

    if (job.jobItems.length > 0) {
        // New line for grouping
        notifications.push({key : "groupHeader", value: "\nDelivery Info"})

        // Delivery Items.
        if(itemString !== '') {
            notifications.push(
                {
                    key: 'Items to Deliver',
                    value: itemString
                }
            );
        }

        // Job pickup locations
        if (job.pickupDetails.length > 0) {
            let messageString = '';
            for (let i = 0; i < job.pickupDetails.length; i++) {
                const pickUpDateTime = await dateTimeFormatter(new Date(job.pickupDetails[i].pickupDateTime));
                messageString += `${pickUpDateTime} - ${job.pickupDetails[i].pickupLocation.addressString}${i == job.pickupDetails.length - 1 ? '' : '\n'}`;
            }
            notifications.push(
                {
                    key: 'Pick up from',
                    value: messageString
                }
            );
        }

        let vesselLoadingLocationDetails = await constructVesselLocationDetails(job);
        if (vesselLoadingLocationDetails) {
            notifications.push(...vesselLoadingLocationDetails)
        }
    }

    // Offland Items
    if(jobOfflandItemString !== '') {
        notifications.push({key : "groupHeader", value: "\nOffland Info"})
        notifications.push(
            {
                key: 'Items to Offland',
                value: jobOfflandItemString
            }
        );

        if (!job.jobItems.length) {
            let vesselLoadingLocationDetails = await constructVesselLocationDetails(job, true);
            if (vesselLoadingLocationDetails) {
                notifications.push(...vesselLoadingLocationDetails)
            }
        }

        // Offland details
        if (job.offlandDetails.length > 0) {
            let messageString = '';
            for (let i = 0; i < job.offlandDetails.length; i++) {
                const offlandDateTime = await dateTimeFormatter(new Date(job.offlandDetails[i].offlandDateTime));
                messageString += `${offlandDateTime} - ${job.offlandDetails[i].offlandLocation.addressString}${i == job.offlandDetails.length - 1 ? '' : '\n'}`;
            }
            notifications.push(
                {
                    key: 'Return Items to',
                    value: messageString
                }
            );
        }
    }

    notifications.push({key : "groupHeader", value: "\nOther Info"})
    // Additional Items.
    if(jobAdditionalItemString !== '') {
        notifications.push(
            {
                key: 'Additional Items',
                value: jobAdditionalItemString
            }
        );
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


    // Remarks.
    if (job.remarks && job.remarks !== "") {
        const remarksArray = job.remarks.split("\n");
        let messageString = '\n';
        for (let i = 0; i < remarksArray.length; i++) {
            messageString += `${remarksArray[i]}\n`;
        }

        notifications.push(
            {
                key: '\nRemarks',
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