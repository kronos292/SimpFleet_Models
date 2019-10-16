module.exports = {
    calculateDeliveryPricing: async(jobItems) => {
        let total = 0;
        for(let i = 0; i < jobItems.length; i++) {
            const jobItem = jobItems[i];
            const {uom, quantity} = jobItem;
            let filteredUOM = uom;
            if(uom === 'Bundle' || uom === 'Blue Bins') {
                filteredUOM = 'Pallet';
            }
            const jobDeliveryItemPricings = await JobDeliveryItemPricing.find({uom: filteredUOM, type: 'working'});
            for(let j = 0; j < jobDeliveryItemPricings.length; j++) {
                const jobDeliveryItemPricing = jobDeliveryItemPricings[j];
                if(jobDeliveryItemPricing.quantityLow <= quantity && jobDeliveryItemPricing.quantityHigh >= quantity) {
                    total += jobDeliveryItemPricing.price;
                    break;
                }
            }
        }
        return total;
    }
};