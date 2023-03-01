const router = require('express').Router();
const mongoose = require('mongoose');
const User = require('../models/user');

router.post('/create', async(req, res) => {
    try {
        const user = new User({
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        })
        await user.save();
        const token = await user.generateAuthToken();
        return res.status(200).json({
            token: token,
            accountid: user._id
        }) 
    } catch (err) {
        if (err instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                message: "Please check your credentials!"
            })
        } else if (err.code === 11000 && err.keyPattern.username === 1) {
            return res.status(400).json({
                message: "Username already exists!"
            })
        } else if (err.code === 11000 && err.keyPattern.email === 1) {
            return res.status(400).json({
                message: "E-Mail is already registered!"
            })
        }
    }
})

router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({
            $or: [{ email: req.body.emailOrUsername }, { username: req.body.emailOrUsername}]
        })
        if (!user) {
            return res.status(400).json({
                message: "Invalid Credentials!"
            })
        }
        if (user.password !== req.body.password) {
            return res.status(400).json({
                message: "Invalid Credentials!"
            })
        }
        const token = await user.generateAuthToken()
        return res.status(200).json({
            login: true,
            token: token,
        })
    } catch(err) {
        if (err instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                message: "Please check your credentials!"
            })
        }
    }
})

module.exports = router;