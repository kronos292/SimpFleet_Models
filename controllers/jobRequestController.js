const {JobRequest} = require('../util/models');

async function create(data) {
    const jobRequest = new JobRequest({
        ...data
    });
    await jobRequest.save();

    return jobRequest;
}

module.exports = {
    create
};