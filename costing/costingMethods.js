const moment = require('moment');

const workingHours = require('./workingHours');
const truckCostings = require('./truckCostings');

const JobAssignment = require('../models/JobAssignment');

const jobCostingBreakdowns = [];

async function isWorkingHours(jobTrip, logisticsCompany) {
    const {startTrip} = jobTrip;
    const workingHoursList = workingHours[logisticsCompany.id];
    const day = startTrip.getDay();
    const workingHoursIndex = workingHoursList[day];
    if(workingHoursIndex) {
        const format = 'HH:mm:ss';
        return moment(startTrip).isBetween(moment(workingHoursIndex.start, format), moment(workingHoursIndex.end, format));
    }

    return false;
}

async function tabulateTruckCosting(jobTrip, logisticsCompany, WHKey) {
    // Get truck and timings from job trip.
    const job = jobTrip.jobs[0];
    const {vessel, vesselLoadingLocation, otherVesselLoadingLocation} = job;
    const {truck} = jobTrip;
    const {startTrip, endTrip} = jobTrip;
    const vesselLoadingLocationName = vesselLoadingLocation.type !== 'others'? vesselLoadingLocation.name: otherVesselLoadingLocation;
    const vesselName = vessel? vessel.vesselName: 'Non-vessel location';

    // Calculate hours.
    const totalHours = moment(endTrip).diff(startTrip, 'hours');

    // Calculate cost.
    let totalCost = 0;
    const truckCategories = truckCostings[logisticsCompany.id];
    for(let i = 0; i < truckCategories.length; i++) {
        const truckCategory = truckCategories[i];
        const {size, type, costs} = truckCategory;
        if(size === truck.size && type === truck.type) {
            const costIndex = costs[WHKey];

            // Calculate start cost.
            const startCostIndex = costIndex.start;
            const {numHours, cost} = startCostIndex;
            const startCost = cost;

            // Calculate sub cost if any.
            const remHours = Math.ceil(totalHours - numHours);
            let subCost = 0;
            if(remHours > 0) {
                const subCostIndex = costIndex.sub;
                const {numHours, cost} = subCostIndex;
                subCost = remHours / numHours * cost;
            }

            totalCost += startCost + subCost;

            break;
        }
    }

    // Form job costing breakdown.
    if(totalCost > 0) {
        const name = "Delivery costs";
        const description = `Delivery costs (${WHKey === 'WH'? 'Working Hours': 'After Working Hours'}) to ${vesselName} at ${vesselLoadingLocationName}.\n\n`
            + `From ${moment(startTrip).format("dddd, Do MMMM YYYY")} to ${moment(endTrip).format("dddd, Do MMMM YYYY")} for a total of ${totalHours.toFixed(2)} hours.\n`;
        jobCostingBreakdowns.push({
            name,
            description,
            cost: totalCost
        });
    }
}

async function tabulateGST() {
    let totalCost = 0;
    for(let i = 0; i < jobCostingBreakdowns; i++) {
        const jobCostingBreakdown = jobCostingBreakdowns[i];
        totalCost += jobCostingBreakdown.cost;
    }

    if(totalCost > 0) {
        const gst = 0.07;
        const cost = totalCost * gst;
        const name = `${gst * 100}% GST`;
        const description = `${gst * 100}% GST charge on sub-total of all costs.`;
        jobCostingBreakdowns.push({
            name,
            description,
            cost
        });
    }
}

async function tabulateJobCostBreakdown(jobTrip) {
    // Get Logistics Company.
    const job = jobTrip.jobs[0];
    const jobAssignment = await JobAssignment.findOne({job: job._id}).populate({
        path: 'logisticsCompany',
        model: 'logisticsCompanies'
    }).select();
    const {logisticsCompany} = jobAssignment;

    // Get working hour key.
    const isWorkingHours = await isWorkingHours(jobTrip, logisticsCompany);
    const WHKey = isWorkingHours? 'WH': 'AWH';

    // Get truck costing.
    await tabulateTruckCosting(jobTrip, logisticsCompany, WHKey);

    // Calculate GST.
    await tabulateGST();

    return jobCostingBreakdowns;
}

module.exports = {
    tabulateJobCostBreakdown
};
