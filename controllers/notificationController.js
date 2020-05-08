const {Notification} = require('../util/models');

// Function to find and populate notifications
async function find(findMethod, params) {
    return await Notification[findMethod](params).select();
}

// Function to create new Notifications.
async function create(data) {
    const {user, job, callTime, isEmail, type} = data;

    const notification = new Notification({
        user,
        job,
        callTime,
        isEmail,
        type
    });
    await notification.save();

    return notification;
}

// Function to deactivate notifications
async function deactivate(notifications) {
    for (let i = 0; i < notifications.length; i++) {
        const notification = notifications[i];
        notification.isActive = false;
        await notification.save();
    }
}

module.exports.find = find;
module.exports.create = create;
module.exports.deactivate = deactivate;