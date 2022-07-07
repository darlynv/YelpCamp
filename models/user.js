const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})
// Plug in passport-local-mongoose plugin which will add a username, hash, and salt field to store the username, hashed password, and the salt value
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);