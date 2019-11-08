const nodemailer = require('nodemailer');
const Email = require('email-templates');
const fs = require('fs-extra');
const moment = require('moment-timezone');
const path = require('path');

const JobAssignment = require('../models/JobAssignment');

const keys = require('../../../config/keys');

async function getTemplatePath(templateName) {
    return path.join(__dirname, 'templates', templateName);
}

module.exports = {
    sendAutomatedEmail: async (email, subject, htmlText, attachments) => {
        // Generate email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL,
                pass: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL_PASSWORD
            }
        });
        const mailOptions = {
            from: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL,
            to: email,
            subject: subject,
            html: htmlText,
            attachments
        };
        transporter.sendMail(mailOptions, async (err, info) => {
            if (err) {
                throw(err);
            }

            // Delete attachment files
            if (attachments !== null) {
                for (let i = 0; i < attachments.length; i++) {
                    const attachment = attachments[i];
                    const path = attachment.path;
                    await fs.unlinkSync(path);
                }
            }

            // Do not erase - Production Logging
            console.log('Email sent: ' + info.response);
        });
    },
    sendJobBookingAdminConfirmationEmail: async (job) => {
        const email = new Email({
            message: {
                from: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL
            },
            send: true,
            transport: nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL,
                    pass: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL_PASSWORD
                }
            })
        });

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


        // List parties to CC
        const ccList = [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL];

        email.send({
            template: await getTemplatePath('jobBookingAdminConfirmation'),
            message: {
                to: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL,
                subject: `Confirmation Needed: Job booking for ${job.vessel.vesselName} IMO ${job.vessel.vesselIMOID}`,
                cc: ccList
            },
            locals: {
                user: job.user,
                job,
                itemString,
                jobOfflandItemString,
                vesselLoadingDateTime: job.vesselLoadingDateTime !== ""? moment(new Date(job.vesselLoadingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a'): "",
                psaBerthingDateTime: job.psaBerthingDateTime !== ""? moment(new Date(job.psaBerthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a'): "",
                psaUnberthingDateTime: job.psaUnberthingDateTime !== ""? moment(new Date(job.psaUnberthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a'): "",
                // vesselLighterDateTime: job.vesselLighterDateTime !== ""? moment(new Date(job.vesselLighterDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a'): "",
            }
        }).then(console.log).catch(console.error);
    },
    sendJobBookingAdminCancellationConfirmation: async(job) => {
        const email = new Email({
            message: {
                from: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL
            },
            send: true,
            transport: nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL,
                    pass: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL_PASSWORD
                }
            })
        });

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

        let pickupLocationsStringArray = [];
        if(job.pickupDetails) {
            for (let i = 0; i < job.pickupDetails.length; i++) {
                const pickupDetail = job.pickupDetails[i];
                const pickUpDateTime = moment.tz(new Date(pickupDetail.pickupLocations), "Asia/Singapore").format('MMMM DD YYYY, HH:mm');
                pickupLocationsStringArray.push(pickUpDateTime + ' - ' + pickupDetail.pickupLocation.addressString);
            }
        }


        email.send({
            template: await getTemplatePath('jobBookingAdminCancellationConfirmation'),
            message: {
                to: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL,
                subject: `Job Cancellation Confirmed - ${job.jobId}`,
                cc: [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL]
            },
            locals: {
                user: job.user,
                job,
                itemString,
                jobOfflandItemString,
                pickupLocationsStringArray,
                vesselLoadingDateTime: job.vesselLoadingDateTime !== ""? moment(new Date(job.vesselLoadingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a'): "",
                psaBerthingDateTime: job.psaBerthingDateTime !== ""? moment(new Date(job.psaBerthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a'): "",
                psaUnberthingDateTime: job.psaUnberthingDateTime !== ""? moment(new Date(job.psaUnberthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a'): "",
            }
        }).then(console.log).catch(console.error);
    },
    sendJobBookingLogisticsOrderEmail: async (job, jobAssignment) => {
        const email = new Email({
            message: {
                from: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL
            },
            send: true,
            transport: nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL,
                    pass: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL_PASSWORD
                }
            })
        });

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

        let pickupLocationsStringArray = [];
        if(job.pickupDetails) {
            for (let i = 0; i < job.pickupDetails.length; i++) {
                const pickupDetail = job.pickupDetails[i];
                const pickUpDateTime = moment.tz(new Date(pickupDetail.pickupLocations), "Asia/Singapore").format('MMMM DD YYYY, HH:mm');
                pickupLocationsStringArray.push(pickUpDateTime + ' - ' + pickupDetail.pickupLocation.addressString);
            }
        }


        email.send({
            template: await getTemplatePath('jobBookingLogisticsOrder'),
            message: {
                to: jobAssignment.logisticsCompany.correspondenceEmails,
                subject: `Job booking for ${job.vessel !== null? `${job.vessel.vesselName} IMO ${job.vessel.vesselIMOID}`: 'Non-Vessel Delivery'}`,
                cc: [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL]
            },
            locals: {
                user: job.user,
                job,
                itemString,
                jobOfflandItemString,
                pickupLocationsStringArray,
                vesselLoadingDateTime: job.vesselLoadingDateTime !== ""? moment(new Date(job.vesselLoadingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a'): "",
                psaBerthingDateTime: job.psaBerthingDateTime !== ""? moment(new Date(job.psaBerthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a'): "",
                psaUnberthingDateTime: job.psaUnberthingDateTime !== ""? moment(new Date(job.psaUnberthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a'): "",
            }
        }).then(console.log).catch(console.error);
    },
    sendJobBookingLogisticsUpdateEmail: async (job) => {
        const email = new Email({
            message: {
                from: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL
            },
            send: true,
            transport: nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL,
                    pass: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL_PASSWORD
                }
            })
        });

        let {jobItems, jobOfflandItems, careOffParties} = job;

        // Add items of care-off parties
        for (let i = 0; i < careOffParties.length; i++) {
            const careOffParty = careOffParties[i];
            jobItems = jobItems.concat(careOffParty.jobItems);
            jobOfflandItems = jobOfflandItems.concat(careOffParty.jobOfflandItems);
        }

        // Merge job items with duplicate uom
        const mergedJobItems = [];
        for (let i = 0; i < jobItems.length; i++) {
            const jobItem = jobItems[i];
            let foundMergedJobItem = null;
            for (let j = 0; j < mergedJobItems.length; j++) {
                const mergedJobItem = mergedJobItems[j];
                if (mergedJobItem.uom === jobItem.uom) {
                    foundMergedJobItem = mergedJobItem;
                    break;
                }
            }
            if(foundMergedJobItem !== null) {
                foundMergedJobItem.quantity = parseInt(foundMergedJobItem.quantity) + parseInt(jobItem.quantity);
            } else {
                mergedJobItems.push(jobItem);
            }
        }
        jobItems = mergedJobItems;

        // Merge job offland items with duplicate uom
        const mergedJobOfflandItems = [];
        for (let i = 0; i < jobOfflandItems.length; i++) {
            const jobOfflandItem = jobOfflandItems[i];
            let foundMergedJobItem = null;
            for (let j = 0; j < mergedJobOfflandItems.length; j++) {
                const mergedJobItem = mergedJobOfflandItems[j];
                if (mergedJobItem.uom === jobOfflandItem.uom) {
                    foundMergedJobItem = mergedJobItem;
                    break;
                }
            }
            if(foundMergedJobItem !== null) {
                foundMergedJobItem.quantity = parseInt(foundMergedJobItem.quantity) + parseInt(jobOfflandItem.quantity);
            } else {
                mergedJobOfflandItems.push(jobOfflandItem);
            }
        }
        jobOfflandItems = mergedJobOfflandItems;

        let itemString = jobItems.length > 0 ? `${jobItems[0].quantity} ${jobItems[0].uom}` : '';
        for (let i = 1; i < jobItems.length; i++) {
            const jobItem = jobItems[i];
            itemString += `, ${jobItem.quantity} ${jobItem.uom}`
        }

        let jobOfflandItemString = jobOfflandItems.length > 0 ? `${jobOfflandItems[0].quantity} ${jobOfflandItems[0].uom}` : '';
        for (let i = 1; i < jobOfflandItems.length; i++) {
            const jobOfflandItem = jobOfflandItems[i];
            jobOfflandItemString += `, ${jobOfflandItem.quantity} ${jobOfflandItem.uom}`
        }

        let pickupLocationsStringArray = [];
        if(job.pickupDetails) {
            for (let i = 0; i < job.pickupDetails.length; i++) {
                const pickupDetail = job.pickupDetails[i];
                const pickUpDateTime = moment.tz(new Date(pickupDetail.pickupDateTime), "Asia/Singapore").format('DD MMMM YYYY, HH:mm');
                pickupLocationsStringArray.push(pickUpDateTime + ' - ' + pickupDetail.pickupLocation.addressString);
            }
        }


        // Get job assignment
        const jobAssignment = await JobAssignment.findOne({job: job._id}).populate({
            path: 'logisticsCompany',
            model: 'logisticsCompanies'
        }).select();

        email.send({
            template: await getTemplatePath('jobBookingLogisticsUpdate'),
            message: {
                to: jobAssignment.logisticsCompany.correspondenceEmails,
                subject: `Job details update: ${job.vessel.vesselName} IMO ${job.vessel.vesselIMOID}`,
                cc: [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL]
            },
            locals: {
                user: job.user,
                job,
                itemString,
                jobOfflandItemString,
                pickupLocationsStringArray,
                vesselLoadingDateTime: job.vesselLoadingDateTime !== ""? moment(new Date(job.vesselLoadingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a'): "",
                psaBerthingDateTime: job.psaBerthingDateTime !== ""? moment(new Date(job.psaBerthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a'): "",
                psaUnberthingDateTime: job.psaUnberthingDateTime !== ""? moment(new Date(job.psaUnberthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a'): "",
            }
        }).then(console.log).catch(console.error);
    },
    sendUserSignUpConfirmationEmail: async (user) => {
        const email = new Email({
            message: {
                from: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL
            },
            send: true,
            transport: nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL,
                    pass: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL_PASSWORD
                }
            })
        });

        email.send({
            template: await getTemplatePath('userSignUpConfirmation'),
            message: {
                to: user.email,
                subject: `Sign Up Confirmed`,
                cc: [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL]
            },
            locals: {
                user,
            }
        }).then(console.log).catch(console.error);
    },
    sendUserJobConfirmationEmail: async (job) => {
        const email = new Email({
            message: {
                from: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL
            },
            send: true,
            transport: nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL,
                    pass: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL_PASSWORD
                }
            })
        });

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

        email.send({
            template: await getTemplatePath('userJobBookingConfirmation'),
            message: {
                to: job.user.email,
                subject: `Job Booking Confirmed - ${job.jobId}`,
                cc: [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL]
            },
            locals: {
                user: job.user,
                job,
                itemString,
                jobOfflandItemString,
                vesselLoadingDateTime: job.vesselLoadingDateTime !== "" ? moment(new Date(job.vesselLoadingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
                psaBerthingDateTime: job.psaBerthingDateTime !== "" ? moment(new Date(job.psaBerthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
                psaUnberthingDateTime: job.psaUnberthingDateTime !== "" ? moment(new Date(job.psaUnberthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
                // vesselLighterDateTime: job.vesselLighterDateTime !== "" ? moment(new Date(job.vesselLighterDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
            }
        }).then(console.log).catch(console.error);
    },
    sendUserJobApprovalEmail: async (job) => {
        const email = new Email({
            message: {
                from: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL
            },
            send: true,
            transport: nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL,
                    pass: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL_PASSWORD
                }
            })
        });

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

        let pickupLocationsStringArray = [];
        if(job.pickupDetails) {
            for (let i = 0; i < job.pickupDetails.length; i++) {
                const pickupDetail = job.pickupDetails[i];
                const pickUpDateTime = moment.tz(new Date(pickupDetail.pickupLocations), "Asia/Singapore").format('MMMM DD YYYY, HH:mm');
                pickupLocationsStringArray.push(pickUpDateTime + ' - ' + pickupDetail.pickupLocation.addressString);
            }
        }


        email.send({
            template: await getTemplatePath('userJobBookingApproval'),
            message: {
                to: job.user.email,
                subject: `Job Booking Approved - ${job.jobId}`,
                cc: [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL]
            },
            locals: {
                user: job.user,
                job,
                itemString,
                jobOfflandItemString,
                pickupLocationsStringArray,
                vesselLoadingDateTime: job.vesselLoadingDateTime !== "" ? moment(new Date(job.vesselLoadingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
                psaBerthingDateTime: job.psaBerthingDateTime !== "" ? moment(new Date(job.psaBerthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
                psaUnberthingDateTime: job.psaUnberthingDateTime !== "" ? moment(new Date(job.psaUnberthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
                // vesselLighterDateTime: job.vesselLighterDateTime !== "" ? moment(new Date(job.vesselLighterDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
            }
        }).then(console.log).catch(console.error);
    },
    sendUserJobCancellationConfirmation: async (job) => {
        const email = new Email({
            message: {
                from: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL
            },
            send: true,
            transport: nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL,
                    pass: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL_PASSWORD
                }
            })
        });

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

        let pickupLocationsStringArray = [];
        if(job.pickupDetails) {
            for (let i = 0; i < job.pickupDetails.length; i++) {
                const pickupDetail = job.pickupDetails[i];
                const pickUpDateTime = moment.tz(new Date(pickupDetail.pickupLocations), "Asia/Singapore").format('MMMM DD YYYY, HH:mm');
                pickupLocationsStringArray.push(pickUpDateTime + ' - ' + pickupDetail.pickupLocation.addressString);
            }
        }


        email.send({
            template: await getTemplatePath('userJobBookingCancellationConfirmation'),
            message: {
                to: job.user.email,
                subject: `Job Cancellation Confirmed - ${job.jobId}`,
                cc: [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL]
            },
            locals: {
                user: job.user,
                job,
                itemString,
                jobOfflandItemString,
                pickupLocationsStringArray,
                vesselLoadingDateTime: job.vesselLoadingDateTime !== "" ? moment(new Date(job.vesselLoadingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
                psaBerthingDateTime: job.psaBerthingDateTime !== "" ? moment(new Date(job.psaBerthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
                psaUnberthingDateTime: job.psaUnberthingDateTime !== "" ? moment(new Date(job.psaUnberthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : ""
            }
        }).then(console.log).catch(console.error);
    },
    sendUserJobStatusUpdateEmail: async (job, index) => {
        const email = new Email({
            message: {
                from: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL
            },
            send: true,
            transport: nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL,
                    pass: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL_PASSWORD
                }
            })
        });

        let {jobItems, jobOfflandItems, careOffParties} = job;

        // Add items of care-off parties
        for (let i = 0; i < careOffParties.length; i++) {
            const careOffParty = careOffParties[i];
            jobItems = jobItems.concat(careOffParty.jobItems);
            jobOfflandItems = jobOfflandItems.concat(careOffParty.jobOfflandItems);
        }

        // Merge job items with duplicate uom
        const mergedJobItems = [];
        for (let i = 0; i < jobItems.length; i++) {
            const jobItem = jobItems[i];
            let foundMergedJobItem = null;
            for (let j = 0; j < mergedJobItems.length; j++) {
                const mergedJobItem = mergedJobItems[j];
                if (mergedJobItem.uom === jobItem.uom) {
                    foundMergedJobItem = mergedJobItem;
                    break;
                }
            }
            if(foundMergedJobItem !== null) {
                foundMergedJobItem.quantity = parseInt(foundMergedJobItem.quantity) + parseInt(jobItem.quantity);
            } else {
                mergedJobItems.push(jobItem);
            }
        }
        jobItems = mergedJobItems;

        // Merge job offland items with duplicate uom
        const mergedJobOfflandItems = [];
        for (let i = 0; i < jobOfflandItems.length; i++) {
            const jobOfflandItem = jobOfflandItems[i];
            let foundMergedJobItem = null;
            for (let j = 0; j < mergedJobOfflandItems.length; j++) {
                const mergedJobItem = mergedJobOfflandItems[j];
                if (mergedJobItem.uom === jobOfflandItem.uom) {
                    foundMergedJobItem = mergedJobItem;
                    break;
                }
            }
            if(foundMergedJobItem !== null) {
                foundMergedJobItem.quantity = parseInt(foundMergedJobItem.quantity) + parseInt(jobOfflandItem.quantity);
            } else {
                mergedJobOfflandItems.push(jobOfflandItem);
            }
        }
        jobOfflandItems = mergedJobOfflandItems;

        let itemString = jobItems.length > 0 ? `${jobItems[0].quantity} ${jobItems[0].uom}` : '';
        for (let i = 1; i < jobItems.length; i++) {
            const jobItem = jobItems[i];
            itemString += `, ${jobItem.quantity} ${jobItem.uom}`
        }

        let jobOfflandItemString = jobOfflandItems.length > 0 ? `${jobOfflandItems[0].quantity} ${jobOfflandItems[0].uom}` : '';
        for (let i = 1; i < jobOfflandItems.length; i++) {
            const jobOfflandItem = jobOfflandItems[i];
            jobOfflandItemString += `, ${jobOfflandItem.quantity} ${jobOfflandItem.uom}`
        }

        let statusUpdate;
        if (index === 3) {
            statusUpdate = "Our warehouse is currently waiting for the arrival of your items.";
        } else if (index === 4) {
            statusUpdate = "Our warehouse has received all of your items, and are ready to deliver at the allotted time.";
        } else if (index === 5) {
            statusUpdate = "We are currently on the way to deliver your items to the delivery location.";
        } else if (index === 6) {
            statusUpdate = "We have successfully delivered your items to the vessel.";
        }

        let pickupLocationsStringArray = [];
        if(job.pickupDetails) {
            for (let i = 0; i < job.pickupDetails.length; i++) {
                const pickupDetail = job.pickupDetails[i];
                const pickUpDateTime = moment.tz(new Date(pickupDetail.pickupLocations), "Asia/Singapore").format('MMMM DD YYYY, HH:mm');
                pickupLocationsStringArray.push(pickUpDateTime + ' - ' + pickupDetail.pickupLocation.addressString);
            }
        }


        email.send({
            template: await getTemplatePath('userJobStatusUpdate'),
            message: {
                to: job.user.email,
                subject: `Job Status Update - ${job.jobId}`,
                cc: [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL]
            },
            locals: {
                user: job.user,
                job,
                itemString,
                jobOfflandItemString,
                pickupLocationsStringArray,
                vesselLoadingDateTime: job.vesselLoadingDateTime !== "" ? moment(new Date(job.vesselLoadingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
                psaBerthingDateTime: job.psaBerthingDateTime !== "" ? moment(new Date(job.psaBerthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
                psaUnberthingDateTime: job.psaUnberthingDateTime !== "" ? moment(new Date(job.psaUnberthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
                // vesselLighterDateTime: job.vesselLighterDateTime !== "" ? moment(new Date(job.vesselLighterDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
                statusUpdate
            }
        }).then(console.log).catch(console.error);
    },
    sendJobFileUploadLogisticsEmail: async (jobFile, job) => {
        const email = new Email({
            message: {
                from: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL
            },
            send: true,
            transport: nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL,
                    pass: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL_PASSWORD
                }
            })
        });

        const {requirements} = jobFile;
        let signAndReturn = false;
        let needPrintCopy = false;
        for (let i = 0; i < requirements.length; i++) {
            const requirement = requirements[i];
            if (requirement.key === signAndReturn) {
                signAndReturn = requirement.check;
            } else if (requirement.key === needPrintCopy) {
                needPrintCopy = requirement.check;
            }
        }

        // Get job assignment
        const jobAssignment = await JobAssignment.findOne({job: job._id}).populate({
            path: 'logisticsCompany',
            model: 'logisticsCompanies'
        }).select();

        email.send({
            template: await getTemplatePath('jobFileUploadLogistics'),
            message: {
                to: jobAssignment.logisticsCompany.correspondenceEmails,
                subject: `New document submitted for job ${job.jobId}`,
                cc: [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL],
                attachments: [
                    {
                        filename: jobFile.filename,
                        path: jobFile.fileURL
                    }
                ]
            },
            locals: {
                job,
                jobFile,
                signAndReturn,
                needPrintCopy
            }
        }).then(console.log).catch(console.error);
    },
    sendUserEmailReminderDocUpload: async (notification) => {
        const email = new Email({
            message: {
                from: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL
            },
            send: true,
            transport: nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL,
                    pass: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL_PASSWORD
                }
            })
        });

        const {job} = notification;
        let {jobItems, jobOfflandItems, careOffParties} = job;

        // Add items of care-off parties
        for (let i = 0; i < careOffParties.length; i++) {
            const careOffParty = careOffParties[i];
            jobItems = jobItems.concat(careOffParty.jobItems);
            jobOfflandItems = jobOfflandItems.concat(careOffParty.jobOfflandItems);
        }

        // Merge job items with duplicate uom
        const mergedJobItems = [];
        for (let i = 0; i < jobItems.length; i++) {
            const jobItem = jobItems[i];
            let foundMergedJobItem = null;
            for (let j = 0; j < mergedJobItems.length; j++) {
                const mergedJobItem = mergedJobItems[j];
                if (mergedJobItem.uom === jobItem.uom) {
                    foundMergedJobItem = mergedJobItem;
                    break;
                }
            }
            if(foundMergedJobItem !== null) {
                foundMergedJobItem.quantity = parseInt(foundMergedJobItem.quantity) + parseInt(jobItem.quantity);
            } else {
                mergedJobItems.push(jobItem);
            }
        }
        jobItems = mergedJobItems;

        // Merge job offland items with duplicate uom
        const mergedJobOfflandItems = [];
        for (let i = 0; i < jobOfflandItems.length; i++) {
            const jobOfflandItem = jobOfflandItems[i];
            let foundMergedJobItem = null;
            for (let j = 0; j < mergedJobOfflandItems.length; j++) {
                const mergedJobItem = mergedJobOfflandItems[j];
                if (mergedJobItem.uom === jobOfflandItem.uom) {
                    foundMergedJobItem = mergedJobItem;
                    break;
                }
            }
            if(foundMergedJobItem !== null) {
                foundMergedJobItem.quantity = parseInt(foundMergedJobItem.quantity) + parseInt(jobOfflandItem.quantity);
            } else {
                mergedJobOfflandItems.push(jobOfflandItem);
            }
        }
        jobOfflandItems = mergedJobOfflandItems;

        let itemString = jobItems.length > 0 ? `${jobItems[0].quantity} ${jobItems[0].uom}` : '';
        for (let i = 1; i < jobItems.length; i++) {
            const jobItem = jobItems[i];
            itemString += `, ${jobItem.quantity} ${jobItem.uom}`
        }

        let jobOfflandItemString = jobOfflandItems.length > 0 ? `${jobOfflandItems[0].quantity} ${jobOfflandItems[0].uom}` : '';
        for (let i = 1; i < jobOfflandItems.length; i++) {
            const jobOfflandItem = jobOfflandItems[i];
            jobOfflandItemString += `, ${jobOfflandItem.quantity} ${jobOfflandItem.uom}`
        }

        let pickupLocationsStringArray = [];
        if(job.pickupDetails) {
            for (let i = 0; i < job.pickupDetails.length; i++) {
                const pickupDetail = job.pickupDetails[i];
                const pickUpDateTime = moment.tz(new Date(pickupDetail.pickupLocations), "Asia/Singapore").format('MMMM DD YYYY, HH:mm');
                pickupLocationsStringArray.push(pickUpDateTime + ' - ' + pickupDetail.pickupLocation.addressString);
            }
        }

        email.send({
            template: await getTemplatePath('userJobDocUploadReminder'),
            message: {
                to: notification.user.email,
                subject: `Document Upload Reminder - Job ${notification.job.jobId}`,
                cc: [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL]
            },
            locals: {
                user: notification.user,
                job,
                itemString,
                jobOfflandItemString,
                pickupLocationsStringArray,
                vesselLoadingDateTime: job.vesselLoadingDateTime !== "" ? moment(new Date(job.vesselLoadingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
                psaBerthingDateTime: job.psaBerthingDateTime !== "" ? moment(new Date(job.psaBerthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
                psaUnberthingDateTime: job.psaUnberthingDateTime !== "" ? moment(new Date(job.psaUnberthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
            }
        }).then(console.log).catch(console.error);
    },
    sendJobLinkSharingInvite: async (userEmail, job, jobLink) => {
        const email = new Email({
            message: {
                from: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL
            },
            send: true,
            transport: nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL,
                    pass: keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL_PASSWORD
                }
            })
        });

        email.send({
            template: await getTemplatePath('jobLinkSharingInvite'),
            message: {
                to: userEmail,
                subject: `Job Invite - ${job.vessel.vesselName}`,
                cc: [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL]
            },
            locals: {
                job,
                jobLink
            }
        }).then(console.log).catch(console.error);
    }
};
