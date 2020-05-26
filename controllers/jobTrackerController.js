const {JobTracker} = require('../util/models');

async function create(data) {
    const jobTracker = new JobTracker({
        ...data
    });
    await jobTracker.save();

    return jobTracker;
}

module.exports = {
    create
};