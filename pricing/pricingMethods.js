const DeliveryPricingTimeRange = require('../models/DeliveryPricingTimeRange');
const JobDeliveryItemPricing = require('../models/JobDeliveryItemPricing');
const Job = require('../models/Job');
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

    indexJobItemPricing: async (jobItem) => {
        const job = jobItem.job;
        let serial = '';
        let beforeTime = moment('08:30:00', 'hh:mm:ss');
        let afterTime = moment('17:30:00', 'hh:mm:ss');
        let quantity = jobItem.quantity;
        let deliveryTime;
        if (job.vesselLoadingLocation.type === 'port') {
            //for now use berthing time, eventually might need change to delivery time
            deliveryTime = job.psaBerthingDateTime;
        } else {
            deliveryTime = job.vesselLoadingDateTime
        }
        deliveryTime = moment.tz(new Date(deliveryTime), "Asia/Singapore");
        if (moment(deliveryTime, 'hh:mm:ss').isBetween(beforeTime, afterTime)) {
            serial += "WH"
        } else {
            serial += "AWH"
        }
        if (deliveryTime.isoWeekday() <= 6) {
            serial += "WD"
        } else {
            serial += "NWD"
        }
        if (quantity === 1) {
            serial += "1"
        } else if (quantity === 2) {
            serial += "2"
        } else if (quantity === 3 || quantity === 4) {
            serial += "3"
        } else if (quantity === 5) {
            serial += "5"
        } else {
            serial += "6"
        }
        if (jobItem.uom === 'Pallet'){
            serial += 'P'
        }
        return serial;
    }
};