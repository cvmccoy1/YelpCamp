const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");


const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.post("save", function (error, doc, next) {
    // Special case the duplicate email error as the default message is ugly
    const key = (Object.keys(error.keyPattern)[0]);
    if (error.name === "MongoServerError" && error.code === 11000) {
        next(new Error(`A user with the given ${key} is already registered`));
    } else {
        next(error);
    }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);