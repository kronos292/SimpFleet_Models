const {User} = require('../util/models');

// Function to find and populate users
async function find(findMethod, params) {
    return await User[findMethod](params).populate({
        path: 'userCompany',
        model: 'userCompanies',
        populate: {
            path: 'productSuites',
            model: 'productSuites'
        }
    }).select();
}

// Function to create new users.
async function create(data) {
    const user = new User({
        ...data,
        registerDate: new Date()
    });
    await user.save();

    return user;
}

// Function to update users
async function update(params, data) {
    let user = await find('findOne', params);
    user = await User.findByIdAndUpdate(user._id, data, {new: true});
    return user;
}

// Function to create and store hashed password.
async function createHashPassword(user, password) {
    user.password = user.generateHash(password);
    await user.save();
    return user;
}

module.exports.find = find;
module.exports.create = create;
module.exports.update = update;
module.exports.createHashPassword = createHashPassword;