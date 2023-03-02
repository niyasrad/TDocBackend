const router = require('express').Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcrypt');

router.post('/create', async(req, res) => {
    try {
        if (!req.body.password) return res.status(400).json({message: "Enter Password!"});
        const genSalt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, genSalt) 
        const user = new User({
            email: req.body.email,
            username: req.body.username,
            password: hashedPass
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
        const authUser = await bcrypt.compare(req.body.password, user.password);
        if (!authUser) {
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