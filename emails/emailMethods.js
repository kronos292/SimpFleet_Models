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

async function formulateEmailLocals(job) {
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

    return(
        {
            user: job.user,
            job,
            itemString,
            jobOfflandItemString,
            pickupLocationsStringArray,
            vesselLoadingDateTime: job.vesselLoadingDateTime !== ""? moment(new Date(job.vesselLoadingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a'): "",
            psaBerthingDateTime: job.psaBerthingDateTime !== ""? moment(new Date(job.psaBerthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a'): "",
            psaUnberthingDateTime: job.psaUnberthingDateTime !== ""? moment(new Date(job.psaUnberthingDateTime)).tz("Asia/Singapore").format('MMMM Do YYYY, h:mm:ss a'): ""
        }
    );
}

async function sendEmail(emailTo, templateName, emailSubject, ccList, locals, attachments) {
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
            to: emailTo,
            subject: emailSubject,
            cc: ccList,
            attachments
        },
        locals
    }).then(`${templateName} email sent.`).catch(console.error);
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
        const locals = await formulateEmailLocals(job);
        const ccList = [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL];
        const subject = `${job.index} - Confirmation Needed: Job booking for ${job.vessel.vesselName}`;
        const attachments = [];

        await sendEmail(keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL, 'jobBookingAdminConfirmation', subject, ccList, locals, attachments);
    },
    sendJobBookingAdminCancellationConfirmation: async(job) => {
        const locals = await formulateEmailLocals(job);
        const ccList = [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL];
        const subject = `${job.index} - Job Cancellation Confirmed`;
        const attachments = [];

        await sendEmail(keys.SHIP_SUPPLIES_DIRECT_SALES_EMAIL, 'jobBookingAdminCancellationConfirmation', subject, ccList, locals, attachments);
    },
    sendJobBookingLogisticsOrderEmail: async (job, jobAssignment) => {
        const locals = await formulateEmailLocals(job);
        const ccList = [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL];
        const subject = `${job.index} - New Job Booking`;
        const attachments = [];

        await sendEmail(jobAssignment.logisticsCompany.correspondenceEmails, 'jobBookingLogisticsOrder', subject, ccList, locals, attachments);
    },
    sendJobBookingLogisticsUpdateEmail: async (job) => {
        // Get job assignment
        const jobAssignment = await JobAssignment.findOne({job: job._id}).populate({
            path: 'logisticsCompany',
            model: 'logisticsCompanies'
        }).select();

        const locals = await formulateEmailLocals(job);
        const ccList = [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL];
        const subject = `${job.index} - Job Details Update`;
        const attachments = [];

        await sendEmail(jobAssignment.logisticsCompany.correspondenceEmails, 'jobBookingLogisticsUpdate', subject, ccList, locals, attachments);
    },
    sendUserSignUpConfirmationEmail: async (user) => {
        const locals = {
            user
        };
        const ccList = [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL];
        const subject = `Sign Up Confirmed`;
        const attachments = [];

        await sendEmail(user.email, 'userSignUpConfirmation', subject, ccList, locals, attachments);
    },
    sendUserJobConfirmationEmail: async (job) => {
        const locals = await formulateEmailLocals(job);
        const ccList = [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL];
        const subject = `${job.index} - Job Booking Confirmed`;
        const attachments = [];

        await sendEmail(job.user.email, 'userJobBookingConfirmation', subject, ccList, locals, attachments);
    },
    sendUserJobApprovalEmail: async (job) => {
        const locals = await formulateEmailLocals(job);
        const ccList = [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL];
        const subject = `${job.index} - Job Booking Approved`;
        const attachments = [];

        await sendEmail(job.user.email, 'userJobBookingApproval', subject, ccList, locals, attachments);
    },
    sendUserJobCancellationConfirmation: async (job) => {
        const locals = await formulateEmailLocals(job);
        const ccList = [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL];
        const subject = `${job.index} - Job Cancellation Confirmed`;
        const attachments = [];

        await sendEmail(job.user.email, 'userJobBookingCancellationConfirmation', subject, ccList, locals, attachments);
    },
    sendUserJobStatusUpdateEmail: async (job, index) => {
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

        const locals = await formulateEmailLocals(job);
        locals.statusUpdate = statusUpdate;
        const ccList = [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL];
        const subject = `${job.index} - Job Status Update`;
        const attachments = [];

        await sendEmail(job.user.email, 'userJobStatusUpdate', subject, ccList, locals, attachments);
    },
    sendJobFileUploadLogisticsEmail: async (jobFile, job) => {
        // Get job assignment
        const jobAssignment = await JobAssignment.findOne({job: job._id}).populate({
            path: 'logisticsCompany',
            model: 'logisticsCompanies'
        }).select();

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

        const locals = await formulateEmailLocals(job);
        locals.signAndReturn = signAndReturn;
        locals.needPrintCopy = needPrintCopy;
        const ccList = [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL];
        const subject = `${job.index} - New Document Submitted`;
        const attachments = [
            {
                filename: jobFile.filename,
                path: jobFile.fileURL
            }
        ];

        await sendEmail(jobAssignment.logisticsCompany.correspondenceEmails, 'jobFileUploadLogistics', subject, ccList, locals, attachments);
    },
    sendUserEmailReminderDocUpload: async (notification) => {
        const {job} = notification;

        const locals = await formulateEmailLocals(job);
        locals.user = notification.user;
        const ccList = [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL];
        const subject = `${job.index} - Document Upload Reminder`;
        const attachments = [];

        await sendEmail(notification.user.email, 'userJobDocUploadReminder', subject, ccList, locals, attachments);
    },
    sendJobLinkSharingInvite: async (userEmail, job, jobLink) => {
        const locals = await formulateEmailLocals(job);
        locals.jobLink = jobLink;
        const ccList = [keys.SHIP_SUPPLIES_DIRECT_TEAM_EMAIL];
        const subject = `${job.index} - Job Invitation`;
        const attachments = [];

        await sendEmail(userEmail, 'jobLinkSharingInvite', subject, ccList, locals, attachments);
    }
};
