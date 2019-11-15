const DeliveryPricingTimeRange = require('../models/DeliveryPricingTimeRange');
const Job = require('../models/Job');
const JobDeliveryItemPricing = require('../models/JobDeliveryItemPricing');
const JobItemPriceIndex = require('../models/JobItemPriceIndex');
const moment = require('moment-timezone');

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
        }).select();

        let serial = '';
        if (type === 'Delivery') {
            serial += 'D'
        } else if (type === 'Collection') {
            serial += 'C'
        } else if (type === 'Offlanding') {
            serial += 'O';
        }
        let quantity = jobItem.quantity;
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
        let beforeTime = moment('08:30:00', 'hh:mm:ss');
        let afterTime = moment('17:30:00', 'hh:mm:ss');
        deliveryTime = moment.tz(new Date(deliveryTime), "Asia/Singapore");
        if(moment(deliveryTime).isBefore(moment({hour: 17, minute: 30}))){
            console.log('before 1730')
        }
        if(moment(deliveryTime).isAfter(moment({hour: 8, minute: 30}))){
            console.log('after 830')
        }
        console.log(deliveryTime.isoWeekday() + 'day')

        if (moment(deliveryTime).isBefore(moment({hour: 17, minute: 30})) && moment(deliveryTime).isAfter(moment({hour: 8, minute: 30})) && deliveryTime.isoWeekday() <= 6) {
            serial += "WH"
        } else {
            serial += "NWH"
        }
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