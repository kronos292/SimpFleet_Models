const _ = require('lodash');

const {JobTracker, LoadingDetail} = require('../util/models');

async function find(findMethod, params) {
    return await JobTracker[findMethod](params).populate({
        path: 'job',
        model: 'jobs'
    }).select();
}

async function create(data) {
    const jobTracker = new JobTracker({
        ...data
    });
    await jobTracker.save();

    return jobTracker;
}

// Create job trackers based on job requirements.
async function addJobCreationJobTrackers(job) {
    const {pickupDetails, offlandDetails, jobItems, jobOfflandItems, vesselLoadingLocation, otherVesselLoadingLocation, vesselLoadingDateTime} = job;
    const jobTrackers = [];
    let index = 1;

    // Create loading detail.
    const loadingDetail = new LoadingDetail({
        vesselLoadingLocation,
        otherVesselLoadingLocation,
        vesselLoadingDateTime
    });
    await loadingDetail.save();

    // Add pending confirmation status.
    let description = "We have received your job booking and are currently checking the details. We will send you a confirmation email once everything is verified.";
    jobTrackers.push(
        {
            index: index++,
            timestamp: new Date(),
            trackingType: 'Electronic',
            title: 'Job booking pending confirmation',
            description,
            job: job._id,
            transporterFiles: [],
            userTypes: ['JOB_OWNER', 'ADMIN'],
            location: null,
            type: 'START',
            isCompleted: true,
            isDocumentRequired: false
        }
    );

    // Add pickup or deliver status.
    description = pickupDetails.length > 0? 'We have confirmed your job booking, and will proceed to pick up your items at the designated location.': 'We have confirmed your job booking. Please deliver the items to our warehouse at least 24 hours before the vessel arrives.';
    jobTrackers.push(
        {
            index: index++,
            timestamp: new Date(),
            trackingType: 'Electronic',
            title: 'Job booking confirmed',
            description,
            job: job._id,
            transporterFiles: [],
            userTypes: ['JOB_OWNER', 'ADMIN'],
            location: null,
            type: 'ONGOING',
            isCompleted: true,
            isDocumentRequired: false
        }
    );

    if(jobItems.length > 0) {
        // Add pickups/received statuses.
        if(pickupDetails.length > 0) {
            for(let i = 0; i < pickupDetails.length; i++) {
                const pickupDetail = pickupDetails[i];
                const {pickupLocation} = pickupDetail;
                description = `Our Truck is on the way to ${pickupLocation.addressString} to pick up your items.`;
                jobTrackers.push(
                    {
                        index: index++,
                        timestamp: null,
                        trackingType: 'Pickup',
                        title: 'On the way to Pickup',
                        description,
                        job: job._id,
                        transporterFiles: [],
                        userTypes: ['JOB_OWNER', 'ADMIN'],
                        location: null,
                        type: 'ONGOING',
                        isCompleted: false,
                        isDocumentRequired: false,
                        pickupDetail
                    }
                );
            }
        } else {
            description = 'We have received all of your indicated items. We will proceed to check that everything is in order.';
            jobTrackers.push(
                {
                    index: index++,
                    timestamp: null,
                    trackingType: 'Storage',
                    title: 'All items have been received',
                    description,
                    job: job._id,
                    transporterFiles: [],
                    userTypes: ['JOB_OWNER', 'ADMIN'],
                    location: null,
                    type: 'ONGOING',
                    isCompleted: false,
                    isDocumentRequired: false
                }
            );
        }

        // Add items on delivery status.
        description = 'Your items have been checked and loaded onto our trucks. It is currently on the way to the delivery destination.';
        jobTrackers.push(
            {
                index: index++,
                timestamp: null,
                trackingType: 'Loading',
                title: 'Items are on delivery',
                description,
                job: job._id,
                transporterFiles: [],
                userTypes: ['JOB_OWNER', 'ADMIN'],
                location: null,
                type: 'ONGOING',
                isCompleted: false,
                isDocumentRequired: false,
                loadingDetail
            }
        );

        // Add items delivered status.
        description = 'Your items have been successfully received by the customer.';
        jobTrackers.push(
            {
                index: index++,
                timestamp: null,
                trackingType: 'Electronic',
                title: 'Items have been received by customer',
                description,
                job: job._id,
                transporterFiles: [],
                userTypes: ['JOB_OWNER', 'ADMIN'],
                location: null,
                type: 'ONGOING',
                isCompleted: false,
                isDocumentRequired: false
            }
        );
    } else if(jobOfflandItems.length > 0) {
        // On the way to load status.
        description = 'Our truck is on the way to load your items for offlanding.';
        jobTrackers.push(
            {
                index: index++,
                timestamp: null,
                trackingType: 'Loading',
                title: 'On the way to load items',
                description,
                job: job._id,
                transporterFiles: [],
                userTypes: ['JOB_OWNER', 'ADMIN'],
                location: null,
                type: 'ONGOING',
                isCompleted: false,
                isDocumentRequired: false,
                loadingDetail
            }
        );
    }

    // Add offland statuses.
    for(let i = 0; i < offlandDetails.length; i++) {
        const offlandDetail = offlandDetails[i];
        const {offlandLocation} = offlandDetail;
        description = `Our Truck is on the way to ${offlandLocation.addressString} to offland your items.`;
        jobTrackers.push(
            {
                index: index++,
                timestamp: null,
                trackingType: 'Offland',
                title: 'On the way to Offland',
                description,
                job: job._id,
                transporterFiles: [],
                userTypes: ['JOB_OWNER', 'ADMIN'],
                location: null,
                type: 'ONGOING',
                isCompleted: false,
                isDocumentRequired: false,
                offlandDetail
            }
        );
    }

    // Add job completed status
    description = 'Job has been completed. Feel free to contact us if there are any issues.';
    jobTrackers.push(
        {
            index: index++,
            timestamp: null,
            trackingType: 'Electronic',
            title: 'Job has been completed',
            description,
            job: job._id,
            transporterFiles: [],
            userTypes: ['JOB_OWNER', 'ADMIN'],
            location: null,
            type: 'END',
            isCompleted: false,
            isDocumentRequired: false
        }
    );

    // Insert the job trackers into db.
    return await JobTracker.insertMany(jobTrackers);
}

async function shuffleJobTrackers(jobTrackers, jobTrackerObj, type) {
    // Sort all job trackers by index.
    jobTrackers = jobTrackers.sort((a, b) => {
        return a.index = b.index;
    });

    let newJobTrackers = [];
    if(type === 'REMOVE') {
        let toDeductIndex = false;
        for(let i = 0; i < jobTrackers.length; i++) {
            const jobTracker = jobTrackers[i];
            if(jobTracker._id !== jobTrackerObj._id) {
                if(toDeductIndex) {
                    jobTracker.index = jobTracker.index - 1;
                }
                newJobTrackers.push(jobTracker);
            } else {
                toDeductIndex = true;
            }
        }
    } else if(type === 'ADD') {

    }
}

async function updatePickupTrackers(job, newPickupDetails) {
    let {jobTrackers} = job;
    jobTrackers = jobTrackers.sort((a, b) => {
        return a.index - b.index;
    });
    const pickupJobTrackers = _.filter(jobTrackers, (jobTracker) => {
        return jobTracker.trackingType === 'Pickup';
    });
    for(let i = 0; i < pickupJobTrackers.length; i++) {
        const pickupJobTracker = pickupJobTrackers[i];
        const {pickupDetail} = pickupJobTracker;
        const newPickupDetail = _.find(newPickupDetails, ['_id', pickupDetail._id]);
        if(!newPickupDetail) {
            jobTrackers = await shuffleJobTrackers(jobTrackers, pickupJobTracker, 'REMOVE');
        }
        newPickupDetails = _.remove(newPickupDetails, (newPickupDetail) => {
            return pickupDetail._id === newPickupDetail._id;
        });
    }
    for(let i = 0; i < newPickupDetails.length; i++) {
        // Create a pickup job tracker.
        jobTrackers = await shuffleJobTrackers(jobTrackers, pickupJobTracker, 'ADD');
    }
}

module.exports = {
    find,
    create,
    addJobCreationJobTrackers,
    updatePickupTrackers
};