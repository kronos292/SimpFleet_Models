const DeliveryPricingTimeRange = require('../models/DeliveryPricingTimeRange');
const Job = require('../models/Job');
const JobDeliveryItemPricing = require('../models/JobDeliveryItemPricing');
const JobItemPriceIndex = require('../models/JobItemPriceIndex');
const moment = require('moment');

module.exports = {
    calculateDeliveryPricing: async (jobItems) => {
        let total = 0;
        for (let i = 0; i < jobItems.length; i++) {
            const jobItem = jobItems[i];
            const {uom, quantity} = jobItem;
            let filteredUOM = uom;
            if (uom === 'Bundle' || uom === 'Blue Bins') {
                filteredUOM = 'Pallet';
            }
            const jobDeliveryItemPricings = await JobDeliveryItemPricing.find({uom: filteredUOM, type: 'working'});
            for (let j = 0; j < jobDeliveryItemPricings.length; j++) {
                const jobDeliveryItemPricing = jobDeliveryItemPricings[j];
                if (jobDeliveryItemPricing.quantityLow <= quantity && jobDeliveryItemPricing.quantityHigh >= quantity) {
                    total += jobDeliveryItemPricing.price;
                    break;
                }
            }
        }
        return total;
    },

    indexJobItemPricing: async (jobItem, jobObj, type) => {
        const job = await Job.findOne({_id: jobObj._id}).populate({
            path: 'vesselLoadingLocation',
            model: 'vesselLoadingLocations'
        }).populate({
            path: 'pickupDetails',
            model: 'pickupDetails',
            populate: [
                {
                    path: 'pickupLocation',
                    model: 'pickupLocations'
                }
            ]
        }).select();

        let serial = '';
        if (type === 'Delivery') {
            serial += 'D';
            let deliveryTime;
            if (job.vesselLoadingLocation.type === 'port' && job.psaBerthingDateTime) {
                //for now use berthing time, eventually might need change to delivery time
                deliveryTime = job.psaBerthingDateTime;
            } else if (job.vesselLoadingDateTime) {
                deliveryTime = job.vesselLoadingDateTime
            } else {
                //if no time return 0 price
                console.log("No loading Time");
                return 0;
            }
            deliveryTime = moment(deliveryTime);
            let workingHours = false;
            if (deliveryTime.hours() > 8 && deliveryTime.hours() <17){
                workingHours = true;
            }else if( deliveryTime.hours() === 8 && deliveryTime.minutes() >= 30){
                workingHours = true;
            }else if(deliveryTime.hours() === 17 && deliveryTime.minutes() <= 30){
                workingHours = true;
            }
            if (workingHours && deliveryTime.isoWeekday() <= 6) {
                serial += "WH"
            } else {
                serial += "NWH"
            }
        } else if (type === 'Collection') {
            serial += 'C';
            serial += "WH";
        }
        let quantity = jobItem.quantity;
        if (jobItem.uom === 'Pallet') {
            if (quantity <= 5) {
                serial += quantity + 'P';
            } else {
                serial += "6P"
            }
        }
        let jobItemPriceIndex = await JobItemPriceIndex.findOne({index: serial}).select();
        if (!jobItemPriceIndex) {
            console.log(serial + " index does not exist");
            return 0;
        }
        console.log(serial + " found @ " + jobItemPriceIndex.price);
        return jobItemPriceIndex.price;
    },
    getOfflandingPrice: async (uom) => {
        let serial = 'O';
        if (uom === 'Pallet') {
            serial += 'P'
        } else if (uom === 'Import Permit') {
            serial += 'IP'
        }
        let jobItemPriceIndex = await JobItemPriceIndex.findOne({index: serial}).select();
        if (!jobItemPriceIndex) {
            console.log(serial + " index does not exist");
            return 0;
        }
        console.log(serial + " found @ " + jobItemPriceIndex.price);
        return jobItemPriceIndex.price;
    }

};