const moment = require('moment');
const _ = require('lodash');
const getHolidays = require('public-holidays').getHolidays;

const Job = require('../models/Job');

// Carton price list for Warehouse-Destination deliveries.
const cartonPricingWH = [40, 50];

// Carton price list for Pickup-Destination deliveries.
const cartonPricingPickup = [40, 50];

// Pallet price list for Warehouse-Destination deliveries.
const palletPricingWH = [
    {
        1: 55,
        2: 35,
        3: 30,
        4: 25,
        5: 25
    },
    {
        1: 75,
        2: 45,
        3: 40,
        4: 30,
        5: 30
    }
];

// Pallet price list for Pickup-Destination deliveries.
const palletPricingPickup = [
    {
        1: 75,
        2: 45,
        3: 35,
        4: 30,
        5: 30
    },
    {
        1: 95,
        2: 55,
        3: 45,
        4: 35,
        5: 35
    }
];

// Truck based pricing.
const truckPricing = [
    {
        0: 135,
        1: 40
    },
    {
        0: 155,
        1: 40
    }
];

// Flat rate for offland pricing.
const offlandPrice = 30;

// Pricing breakdown to be set.
let jobPricingBreakdowns = [];

// Function to check if the date is a public holiday.
async function checkPublicHoliday(date) {
    const holidays = await getHolidays({
        country: 'sg',
        lang: 'en',
        start: date,
        end: date
    });

    return holidays.length > 0;
}

// Function to find whether there is pickup in the job.
async function checkForPickup(job) {
    const {pickupDetails} = job;

    return pickupDetails && pickupDetails.length > 0;
}

// Function to get the hour index of the job (WH or After-WH).
async function getHourIndex(job) {
    const {jobTrip} = job;
    const {startTrip} = jobTrip;

    // Check whether trip is starting during WH or After-WH datetime.
    const format = 'HH:mm:ss';
    if((((startTrip.getDay() >= 1 && startTrip.getDay() <= 5) && moment(startTrip).isBetween(moment('08:30:00', format), moment('17:30:00', format))) || (startTrip.getDay() === 6 && moment(startTrip).isBetween(moment('08:30:00', format), moment('12:30:00', format)))) && !await checkPublicHoliday(startTrip)) {
        return 0;
    } else {
        return 1;
    }
}

// Function to get the truck price
async function getTruckPrice(job, truckPriceList) {
    const {jobTrip} = job;
    const {startTrip, endTrip} = jobTrip;
    let totalPrice = truckPriceList[0];
    const subCharge = truckPriceList[1];

    // Calculate number of hours and thus multiply with subsequent charges.
    const firstHours = 4;
    let numHours = Math.ceil(moment(endTrip).diff(startTrip, 'hours') - firstHours);
    if(numHours > 0) {
        totalPrice += numHours * subCharge;
    }

    return totalPrice;
}

// Function to compute price of job items.
async function computeJobItemPrice(job, jobItems) {
    const {index, jobId, vesselLoadingLocation, otherVesselLoadingLocation, vessel, jobTrip} = job;
    const vesselLoadingLocationName = vesselLoadingLocation.type !== 'others'? vesselLoadingLocation.name: otherVesselLoadingLocation;
    const {vesselName} = vessel;
    const {startTrip} = jobTrip;

    const hourIndex = await getHourIndex(job);
    let totalPrice = 0;

    // Determine whether job has pickup.
    const jobHasPickup = await checkForPickup(job);

    // Retrieve price list via working hours.
    const cartonPrice = jobHasPickup? cartonPricingPickup[hourIndex]: cartonPricingWH[hourIndex];
    const palletPriceList = jobHasPickup? palletPricingPickup[hourIndex]: palletPricingWH[hourIndex];
    const truckPriceList = truckPricing[hourIndex];

    for(let i = 0; i < jobItems.length; i++) {
        const jobItem = jobItems[i];
        const {uom, quantity} = jobItem;
        if(uom === 'Carton') {
            totalPrice += cartonPrice * jobItem.quantity;
        } else if(uom === 'Pallet') {
            if(quantity >= 6) {
                totalPrice += await getTruckPrice(job, truckPriceList);
            } else {
                totalPrice += palletPriceList[jobItem.quantity];
            }
        } else if(uom === 'Pipe' || uom === 'Bundle') {
            totalPrice += await getTruckPrice(job, truckPriceList);
        }
    }

    // Check if job has deliveries.
    if(jobItems && jobItems.length > 0) {
        const name = "Delivery charges";
        const description = `Delivery charges (${hourIndex === 0? 'Working Hours': 'After Working Hours'}) to ${vesselName} on ${moment(startTrip).format("dddd, Do MMMM YYYY")} at ${vesselLoadingLocationName}.\n\n`
            + `Job Number: ${jobId}\n`
            + `SimpFleet Job ID: ${index}\n`;
        jobPricingBreakdowns.push({
            name,
            description,
            price: totalPrice
        });
    }
}

// Function to compute price of offland items.
async function computeOfflandItemPrice(job) {
    const {index, jobItems, jobOfflandItems, jobId, vesselLoadingLocation, otherVesselLoadingLocation, vessel, jobTrip} = job;
    const vesselLoadingLocationName = vesselLoadingLocation.type !== 'others'? vesselLoadingLocation.name: otherVesselLoadingLocation;
    const {vesselName} = vessel;
    const {startTrip} = jobTrip;

    const hourIndex = await getHourIndex(job);
    let totalPrice = 0;

    // Check if job has offlanding.
    if(jobOfflandItems && jobOfflandItems.length > 0) {
        if(jobItems && jobItems.length > 0) {
            totalPrice += offlandPrice;
        } else {
            totalPrice += await computeJobItemPrice(job, jobOfflandItems);
        }

        const name = "Offland charges";
        const description = `Offland charges (${hourIndex === 0? 'Working Hours': 'After Working Hours'}) from ${vesselName} on ${moment(startTrip).format("dddd, Do MMMM YYYY")} at ${vesselLoadingLocationName}.\n\n`
            + `Job Number: ${jobId}\n`
            + `SimpFleet Job ID: ${index}\n`;
        jobPricingBreakdowns.push({
            name,
            description,
            price: totalPrice
        });
    }

    return totalPrice;
}

// Function to compute urgent delivery charges.
async function computeUrgentDeliveryPricing(job) {
    const {index, jobId, jobTrip, jobBookingDateTime} = job;
    const {startTrip} = jobTrip;

    if(moment.duration(moment(startTrip).diff(moment(jobBookingDateTime))).asHours() < 4) {
        const name = "Urgent job charges";
        const description = `Urgent job charges.\n\n`
            + `Job Number: ${jobId}\n`
            + `SimpFleet Job ID: ${index}\n`;
        const price = 20;
        jobPricingBreakdowns.push({
            name,
            description,
            price
        });
    }
}

module.exports = {
    tabulateJobPricingBreakdown: async(job) => {
        // Get Job Trip
        const {jobTrip} = job;
        if(!jobTrip) {
            return null;
        }

        // Reset job pricing breakdowns.
        jobPricingBreakdowns = [];

        // Compute job item pricing.
        await computeJobItemPrice(job, job.jobItems);

        // Compute offland item pricing.
        await computeOfflandItemPrice(job);

        // Compute any urgent delivery charges.
        await computeUrgentDeliveryPricing(job);

        return jobPricingBreakdowns;
    }
};
