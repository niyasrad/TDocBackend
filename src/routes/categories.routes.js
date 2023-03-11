const router = require('express').Router();
const { model } = require('mongoose');
const Task = require('../models/task');
const User = require('../models/user');

router.post('/create', async (req, res) => {
    try {
        const userFind = await User.findOne({
            authToken: req.headers.authorization.split(' ')[1]
        })
        if (!userFind) {
            return res.status(400).json({
                message: "Invalid User!"
            })
        }
        
        const findCategory = await Task.findOne({ category: req.body.category, accountid: userFind._id })
        if (findCategory){
            return res.status(400).json({ message: "Category already exists!"})
        }
        const task = new Task({
            title: "The bogus task",
            description: "Please check if this works!",
            task: "Clear this task while query!",
            due: new Date(),
            priority: "LOW",
            bogus: true,
            category: req.body.category,
            accountid: userFind._id
        })
        task.save()
        return res.status(200).json({
            _id: task._id
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
})

router.post('/delete', async (req, res) => {
    try {
        const userFind = await User.findOne({
            authToken: req.headers.authorization.split(' ')[1]
        })
        if (!userFind) {
            return res.status(400).json({
                message: "Invalid User!"
            })
        }
        await Task.deleteMany({ accountid: userFind._id, category: req.body.category });
        return res.status(200).json({
            message: "Category Deleted Successfully!"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Category Not Found!"
        })
    }
})
module.exports = router;