const Job = require('../models/Job');
const moment = require('moment');
const _ = require('lodash');

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

// Function to find whether there is pickup in the job.
async function checkForPickup(job) {
    const {pickupDetails} = job;

    return pickupDetails && pickupDetails.length > 0;
}

// Function to compute total item prices
async function computeItemPricing(job) {
    let totalPrice  = 0;
    const hourIndex = 0;
    const {jobItems} = job;

    // Determine pallet price list.
    const jobHasPickup = await checkForPickup(job);

    // Retrieve price list via working hours.
    const palletPriceList = jobHasPickup? palletPricingPickup[hourIndex]: palletPricingWH[hourIndex];
    const truckPriceList = truckPricing[hourIndex];

    // Compute job item pricing
    for(let i = 0; i < jobItems.length; i++) {
        const jobItem = jobItems[i];
        const {uom, quantity} = jobItem;
        if(uom === 'Pallet' || uom === 'Carton') {
            if(quantity >= 6) {
                totalPrice += truckPriceList[hourIndex];
            } else {
                totalPrice += palletPriceList[jobItem.quantity];
            }
        } else if(uom === 'Pipe' || uom === 'Bundle') {
            totalPrice += truckPriceList[hourIndex];
        }
    }

    return totalPrice;
}

module.exports = {
    calculateJobPricing: async(job) => {
        // Compute item pricing
        return await computeItemPricing(job);
    },
    calculateDeliveryPricing: async (jobItems) => {
        let total = 0;
        // for (let i = 0; i < jobItems.length; i++) {
        //     const jobItem = jobItems[i];
        //     const {uom, quantity} = jobItem;
        //     let filteredUOM = uom;
        //     if (uom === 'Bundle' || uom === 'Blue Bins') {
        //         filteredUOM = 'Pallet';
        //     }
        //     const jobDeliveryItemPricings = await JobDeliveryItemPricing.find({uom: filteredUOM, type: 'working'});
        //     for (let j = 0; j < jobDeliveryItemPricings.length; j++) {
        //         const jobDeliveryItemPricing = jobDeliveryItemPricings[j];
        //         if (jobDeliveryItemPricing.quantityLow <= quantity && jobDeliveryItemPricing.quantityHigh >= quantity) {
        //             total += jobDeliveryItemPricing.price;
        //             break;
        //         }
        //     }
        // }
        return total;
    },

    indexJobItemPricing: async (jobItem, jobObj, type) => {
        // const job = await Job.findOne({_id: jobObj._id}).populate({
        //     path: 'vesselLoadingLocation',
        //     model: 'vesselLoadingLocations'
        // }).populate({
        //     path: 'pickupDetails',
        //     model: 'pickupDetails',
        //     populate: [
        //         {
        //             path: 'pickupLocation',
        //             model: 'pickupLocations'
        //         }
        //     ]
        // }).select();
        //
        // let serial = '';
        // if (type === 'Delivery') {
        //     serial += 'D';
        //     let deliveryTime;
        //     if (job.vesselLoadingLocation.type === 'port' && job.psaBerthingDateTime) {
        //         //for now use berthing time, eventually might need change to delivery time
        //         deliveryTime = job.psaBerthingDateTime;
        //     } else if (job.vesselLoadingDateTime) {
        //         deliveryTime = job.vesselLoadingDateTime
        //     } else {
        //         //if no time return 0 price
        //         console.log("No loading Time");
        //         return 0;
        //     }
        //     deliveryTime = moment(deliveryTime);
        //     let workingHours = false;
        //     if (deliveryTime.hours() > 8 && deliveryTime.hours() <17){
        //         workingHours = true;
        //     }else if( deliveryTime.hours() === 8 && deliveryTime.minutes() >= 30){
        //         workingHours = true;
        //     }else if(deliveryTime.hours() === 17 && deliveryTime.minutes() <= 30){
        //         workingHours = true;
        //     }
        //     if (workingHours && deliveryTime.isoWeekday() <= 6) {
        //         serial += "WH"
        //     } else {
        //         serial += "NWH"
        //     }
        // } else if (type === 'Collection') {
        //     serial += 'C';
        //     serial += "WH";
        // }
        // let quantity = jobItem.quantity;
        // if (jobItem.uom === 'Pallet') {
        //     if (quantity <= 5) {
        //         serial += quantity + 'P';
        //     } else {
        //         serial += "6P"
        //     }
        // }
        // let jobItemPriceIndex = await JobItemPriceIndex.findOne({index: serial}).select();
        // if (!jobItemPriceIndex) {
        //     console.log(serial + " index does not exist");
        //     return 0;
        // }
        // console.log(serial + " found @ " + jobItemPriceIndex.price);
        return 0;
    },
    getOfflandingPrice: async (uom) => {
        // let serial = 'O';
        // if (uom === 'Pallet') {
        //     serial += 'P'
        // } else if (uom === 'Import Permit') {
        //     serial += 'IP'
        // }
        // let jobItemPriceIndex = await JobItemPriceIndex.findOne({index: serial}).select();
        // if (!jobItemPriceIndex) {
        //     console.log(serial + " index does not exist");
        //     return 0;
        // }
        // console.log(serial + " found @ " + jobItemPriceIndex.price);
        return 0;
    }
};