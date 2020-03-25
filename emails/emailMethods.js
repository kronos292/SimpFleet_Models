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

async function sendEmail(templateName, toEmail, subject, ccList, attachments, locals) {
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
        template: await getTemplatePath(templateName),
        message: {
            to: toEmail,
            subject,
            cc: ccList,
            attachments
        },
        locals
    }).then(console.log).catch(console.error);
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

        // Send out email via template
        const templateName = 'jobBookingAdminConfirmation';
        const toEmail = keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL;
        const subject = `Confirmation Needed: Job booking for ${job.vessel.vesselName} IMO ${job.vessel.vesselIMOID}`;
        const ccList = [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL];
        const attachments = [];
        const locals = {
            user: job.user,
            job,
            itemString,
            jobOfflandItemString,
            vesselLoadingDateTime: job.vesselLoadingDateTime !== ""? moment(new Date(job.vesselLoadingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a'): "",
            psaBerthingDateTime: job.psaBerthingDateTime !== ""? moment(new Date(job.psaBerthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a'): "",
            psaUnberthingDateTime: job.psaUnberthingDateTime !== ""? moment(new Date(job.psaUnberthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a'): "",
        };
        await sendEmail(templateName, toEmail, subject, ccList, attachments, locals);
    },
    sendJobBookingAdminCancellationConfirmation: async(job) => {
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
                if(pickupDetail && pickupDetail.pickupLocation && pickupDetail.pickupDateTime) {
                    const pickUpDateTime = moment.tz(new Date(pickupDetail.pickupDateTime), "Asia/Singapore").format('MMMM DD YYYY, HH:mm');
                    pickupLocationsStringArray.push(pickUpDateTime + ' - ' + pickupDetail.pickupLocation.addressString);
                }
            }
        }

        // Send out email via template
        const templateName = 'jobBookingAdminCancellationConfirmation';
        const toEmail = keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL;
        const subject = `Job Cancellation Confirmed - ${job.jobId}`;
        const ccList = [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL];
        const attachments = [];
        const locals = {
            user: job.user,
            job,
            itemString,
            jobOfflandItemString,
            pickupLocationsStringArray,
            vesselLoadingDateTime: job.vesselLoadingDateTime !== ""? moment(new Date(job.vesselLoadingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a'): "",
            psaBerthingDateTime: job.psaBerthingDateTime !== ""? moment(new Date(job.psaBerthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a'): "",
            psaUnberthingDateTime: job.psaUnberthingDateTime !== ""? moment(new Date(job.psaUnberthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a'): "",
        };
        await sendEmail(templateName, toEmail, subject, ccList, attachments, locals);
    },
    sendJobBookingLogisticsOrderEmail: async (job, jobAssignment) => {
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
                if(pickupDetail && pickupDetail.pickupLocation && pickupDetail.pickupDateTime) {
                    const pickUpDateTime = moment.tz(new Date(pickupDetail.pickupDateTime), "Asia/Singapore").format('MMMM DD YYYY, HH:mm');
                    pickupLocationsStringArray.push(pickUpDateTime + ' - ' + pickupDetail.pickupLocation.addressString);
                }
            }
        }

        // Send out email via template
        const templateName = 'jobBookingLogisticsOrder';
        const toEmail = jobAssignment.logisticsCompany.correspondenceEmails;
        const subject = `Job booking for ${job.vessel !== null? `${job.vessel.vesselName} IMO ${job.vessel.vesselIMOID}`: 'Non-Vessel Delivery'}`;
        const ccList = [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL];
        const attachments = [];
        const locals = {
            user: job.user,
            job,
            itemString,
            jobOfflandItemString,
            pickupLocationsStringArray,
            vesselLoadingDateTime: job.vesselLoadingDateTime !== ""? moment(new Date(job.vesselLoadingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a'): "",
            psaBerthingDateTime: job.psaBerthingDateTime !== ""? moment(new Date(job.psaBerthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a'): "",
            psaUnberthingDateTime: job.psaUnberthingDateTime !== ""? moment(new Date(job.psaUnberthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a'): "",
        };
        await sendEmail(templateName, toEmail, subject, ccList, attachments, locals);
    },
    sendJobBookingLogisticsUpdateEmail: async (job) => {
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

        if(jobAssignment.logisticsCompany && jobAssignment.logisticsCompany.correspondenceEmails) {
            // Send out email via template
            const templateName = 'jobBookingLogisticsUpdate';
            const toEmail = jobAssignment.logisticsCompany.correspondenceEmails;
            const subject = `Job ${job.index} details update: ${job.vessel.vesselName} IMO ${job.vessel.vesselIMOID}`;
            const ccList = [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL];
            const attachments = [];
            const locals = {
                user: job.user,
                job,
                itemString,
                jobOfflandItemString,
                pickupLocationsStringArray,
                vesselLoadingDateTime: job.vesselLoadingDateTime !== "" ? moment(new Date(job.vesselLoadingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
                psaBerthingDateTime: job.psaBerthingDateTime !== "" ? moment(new Date(job.psaBerthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
                psaUnberthingDateTime: job.psaUnberthingDateTime !== "" ? moment(new Date(job.psaUnberthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
            };
            await sendEmail(templateName, toEmail, subject, ccList, attachments, locals);
        }
    },
    sendUserSignUpConfirmationEmail: async (user) => {
        // Send out email via template
        const templateName = 'userSignUpConfirmation';
        const toEmail = user.email;
        const subject = `Sign Up Confirmed`;
        const ccList = [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL];
        const attachments = [];
        const locals = {
            user
        };
        await sendEmail(templateName, toEmail, subject, ccList, attachments, locals);
    },
    sendUserJobConfirmationEmail: async (job) => {
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

        // Send out email via template
        const templateName = 'userJobBookingConfirmation';
        const toEmail = job.user.email;
        const subject = `Job Booking Confirmed - ${job.jobId}`;
        const ccList = [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL];
        const attachments = [];
        const locals = {
            user: job.user,
            job,
            itemString,
            jobOfflandItemString,
            vesselLoadingDateTime: job.vesselLoadingDateTime !== "" ? moment(new Date(job.vesselLoadingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
            psaBerthingDateTime: job.psaBerthingDateTime !== "" ? moment(new Date(job.psaBerthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
            psaUnberthingDateTime: job.psaUnberthingDateTime !== "" ? moment(new Date(job.psaUnberthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
        };
        await sendEmail(templateName, toEmail, subject, ccList, attachments, locals);
    },
    sendUserJobApprovalEmail: async (job) => {
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
                if(pickupDetail && pickupDetail.pickupLocation && pickupDetail.pickupDateTime) {
                    const pickUpDateTime = moment.tz(new Date(pickupDetail.pickupDateTime), "Asia/Singapore").format('MMMM DD YYYY, HH:mm');
                    pickupLocationsStringArray.push(pickUpDateTime + ' - ' + pickupDetail.pickupLocation.addressString);
                }
            }
        }

        // Send out email via template
        const templateName = 'userJobBookingApproval';
        const toEmail = job.user.email;
        const subject = `Job Booking Approved - ${job.jobId}`;
        const ccList = [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL];
        const attachments = [];
        const locals = {
            user: job.user,
            job,
            itemString,
            jobOfflandItemString,
            pickupLocationsStringArray,
            vesselLoadingDateTime: job.vesselLoadingDateTime !== "" ? moment(new Date(job.vesselLoadingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
            psaBerthingDateTime: job.psaBerthingDateTime !== "" ? moment(new Date(job.psaBerthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
            psaUnberthingDateTime: job.psaUnberthingDateTime !== "" ? moment(new Date(job.psaUnberthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
        };
        await sendEmail(templateName, toEmail, subject, ccList, attachments, locals);
    },
    sendUserJobCancellationConfirmation: async (job) => {
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
                if(pickupDetail && pickupDetail.pickupLocation && pickupDetail.pickupDateTime) {
                    const pickUpDateTime = moment.tz(new Date(pickupDetail.pickupDateTime), "Asia/Singapore").format('MMMM DD YYYY, HH:mm');
                    pickupLocationsStringArray.push(pickUpDateTime + ' - ' + pickupDetail.pickupLocation.addressString);
                }
            }
        }

        // Send out email via template
        const templateName = 'userJobBookingCancellationConfirmation';
        const toEmail = job.user.email;
        const subject = `Job Cancellation Confirmed - ${job.jobId}`;
        const ccList = [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL];
        const attachments = [];
        const locals = {
            user: job.user,
            job,
            itemString,
            jobOfflandItemString,
            pickupLocationsStringArray,
            vesselLoadingDateTime: job.vesselLoadingDateTime !== "" ? moment(new Date(job.vesselLoadingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
            psaBerthingDateTime: job.psaBerthingDateTime !== "" ? moment(new Date(job.psaBerthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
            psaUnberthingDateTime: job.psaUnberthingDateTime !== "" ? moment(new Date(job.psaUnberthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : ""
        };
        await sendEmail(templateName, toEmail, subject, ccList, attachments, locals);
    },
    sendUserJobStatusUpdateEmail: async (job, index) => {
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
            statusUpdate = "We have confirmed your job booking. Your job details have been passed to our operations side for processing.";
        } else if (index === 4) {
            statusUpdate = "We have picked up/received all of your indicated items. We will proceed to check that everything is in order.";
        } else if (index === 5) {
            statusUpdate = "Your items have been checked and loaded onto our trucks. It is currently on the way to the delivery destination.";
        } else if (index === 6) {
            statusUpdate = "Your items have been successfully received by the customer.";
        }

        let pickupLocationsStringArray = [];
        if(job.pickupDetails) {
            for (let i = 0; i < job.pickupDetails.length; i++) {
                const pickupDetail = job.pickupDetails[i];
                if(pickupDetail && pickupDetail.pickupLocation && pickupDetail.pickupDateTime) {
                    const pickUpDateTime = moment.tz(new Date(pickupDetail.pickupDateTime), "Asia/Singapore").format('MMMM DD YYYY, HH:mm');
                    pickupLocationsStringArray.push(pickUpDateTime + ' - ' + pickupDetail.pickupLocation.addressString);
                }
            }
        }

        // Send out email via template
        const templateName = 'userJobStatusUpdate';
        const toEmail = job.user.email;
        const subject = `Job Status Update - ${job.jobId}`;
        const ccList = [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL];
        const attachments = [];
        const locals = {
            user: job.user,
            job,
            itemString,
            jobOfflandItemString,
            pickupLocationsStringArray,
            vesselLoadingDateTime: job.vesselLoadingDateTime !== "" ? moment(new Date(job.vesselLoadingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
            psaBerthingDateTime: job.psaBerthingDateTime !== "" ? moment(new Date(job.psaBerthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
            psaUnberthingDateTime: job.psaUnberthingDateTime !== "" ? moment(new Date(job.psaUnberthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
            statusUpdate
        };
        await sendEmail(templateName, toEmail, subject, ccList, attachments, locals);
    },
    sendJobFileUploadLogisticsEmail: async (jobFile, job) => {
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

        // Send out email via template
        const templateName = 'jobFileUploadLogistics';
        const toEmail = jobAssignment.logisticsCompany.correspondenceEmails;
        const subject = `New document submitted for job ${job.jobId}`;
        const ccList = [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL];
        const attachments = [
            {
                filename: jobFile.filename,
                path: jobFile.fileURL
            }
        ];
        const locals = {
            job,
            jobFile,
            signAndReturn,
            needPrintCopy
        };
        await sendEmail(templateName, toEmail, subject, ccList, attachments, locals);
    },
    sendUserEmailReminderDocUpload: async (notification) => {
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
                if(pickupDetail && pickupDetail.pickupLocation && pickupDetail.pickupDateTime) {
                    const pickUpDateTime = moment.tz(new Date(pickupDetail.pickupDateTime), "Asia/Singapore").format('MMMM DD YYYY, HH:mm');
                    pickupLocationsStringArray.push(pickUpDateTime + ' - ' + pickupDetail.pickupLocation.addressString);
                }
            }
        }

        // Send out email via template
        const templateName = 'userJobDocUploadReminder';
        const toEmail = notification.user.email;
        const subject = `Document Upload Reminder - Job ${notification.job.jobId}`;
        const ccList = [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL];
        const attachments = [];
        const locals = {
            user: notification.user,
            job,
            itemString,
            jobOfflandItemString,
            pickupLocationsStringArray,
            vesselLoadingDateTime: job.vesselLoadingDateTime !== "" ? moment(new Date(job.vesselLoadingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
            psaBerthingDateTime: job.psaBerthingDateTime !== "" ? moment(new Date(job.psaBerthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
            psaUnberthingDateTime: job.psaUnberthingDateTime !== "" ? moment(new Date(job.psaUnberthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
        };
        await sendEmail(templateName, toEmail, subject, ccList, attachments, locals);
    },
    sendJobLinkSharingInvite: async (userEmail, job, jobLink) => {
        // Send out email via template
        const templateName = 'jobLinkSharingInvite';
        const toEmail = userEmail;
        const subject = `Job Invite - ${job.vessel.vesselName}`;
        const ccList = [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL];
        const attachments = [];
        const locals = {
            job,
            jobLink
        };
        await sendEmail(templateName, toEmail, subject, ccList, attachments, locals);
    },
    sendLogEmailReminderDocUpload: async (notification) => {
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
                if(pickupDetail && pickupDetail.pickupLocation && pickupDetail.pickupDateTime) {
                    const pickUpDateTime = moment.tz(new Date(pickupDetail.pickupDateTime), "Asia/Singapore").format('MMMM DD YYYY, HH:mm');
                    pickupLocationsStringArray.push(pickUpDateTime + ' - ' + pickupDetail.pickupLocation.addressString);
                }
            }
        }

        // Get job assignment
        const jobAssignment = await JobAssignment.findOne({job: job._id}).populate({
            path: 'logisticsCompany',
            model: 'logisticsCompanies'
        }).select();

        if(jobAssignment.logisticsCompany && jobAssignment.logisticsCompany.correspondenceEmails) {
            // Send out email via template
            const templateName = 'logDocUploadReminder';
            const toEmail = jobAssignment.logisticsCompany.correspondenceEmails;
            const subject = `Document Upload Reminder - Job ${notification.job.jobId}`;
            const ccList = [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL];
            const attachments = [];
            const locals = {
                user: job.user,
                job,
                itemString,
                jobOfflandItemString,
                pickupLocationsStringArray,
                vesselLoadingDateTime: job.vesselLoadingDateTime !== "" ? moment(new Date(job.vesselLoadingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
                psaBerthingDateTime: job.psaBerthingDateTime !== "" ? moment(new Date(job.psaBerthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
                psaUnberthingDateTime: job.psaUnberthingDateTime !== "" ? moment(new Date(job.psaUnberthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a') : "",
            };
            await sendEmail(templateName, toEmail, subject, ccList, attachments, locals);
        }
    }
};
