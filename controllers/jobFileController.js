const {JobFile} = require('../util/models');

// Function to find and populate job files.
async function find(findMethod, params) {
    return await JobFile[findMethod](params).select();
}

// Function to create new job files.
async function create(data) {
    const jobFile = new JobFile({
        ...data
    });
    await jobFile.save();

    return jobFile;
}

// Function to update job files.
async function update(params, data) {
    let jobFile = await find('findOne', params);
    jobFile = await JobFile.findByIdAndUpdate(jobFile._id, data, {new: true});
    return jobFile;
}

module.exports.find = find;
module.exports.create = create;
module.exports.update = update;