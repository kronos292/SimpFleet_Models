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

    indexJobItemPricing: async (jobItem, job,type) => {
        let serial = '';
        if (type === 'Delivery'){
            serial += 'D'
        } else if(type === 'Collection'){
            serial += 'C'
        } else if(type==='Offlanding'){
            serial += 'O';
        }
        let beforeTime = moment('08:30:00', 'hh:mm:ss');
        let afterTime = moment('17:30:00', 'hh:mm:ss');
        let quantity = jobItem.quantity;
        let deliveryTime;
        if (job.vesselLoadingLocation.type === 'port' && job.psaBerthingDateTime) {
            //for now use berthing time, eventually might need change to delivery time
            deliveryTime = job.psaBerthingDateTime;
        } else if (job.vesselLoadingDateTime){
            deliveryTime = job.vesselLoadingDateTime
        }else{
            //if no time return 0 price
            return 0;
        }
        deliveryTime = moment.tz(new Date(deliveryTime), "Asia/Singapore");
        if (moment(deliveryTime, 'hh:mm:ss').isBetween(beforeTime, afterTime) && deliveryTime.isoWeekday() <= 6) {
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
        let JobItemPriceIndex = await JobItemPriceIndex.findOne({index:serial}).select();
        if (!JobItemPriceIndex){
            return 0;
        }
        return JobItemPriceIndex.price;
    },
    getOfflandingPrice: async (uom) => {
        let serial = 'O';
        if (uom === 'Pallet') {
            serial += 'P'
        }else if(uom === 'Import Permit'){
            serial += 'IP'
        }
        let JobItemPriceIndex = await JobItemPriceIndex.findOne({index:serial}).select();
        if (!JobItemPriceIndex){
            return 0;
        }
        return JobItemPriceIndex.price;
    }

};