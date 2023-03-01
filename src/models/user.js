const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    authToken: {
        type: String
    }
})

userSchema.methods.generateAuthToken = async function() {
    this.authToken = undefined;
    await this.save();

    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET , { expiresIn: '1h' });
    console.log("This",this)
    this.authToken = token;
    await this.save();
    console.log("This",this)
    return token;
}

module.exports = mongoose.model('User', userSchema);