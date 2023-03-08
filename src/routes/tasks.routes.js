const router = require('express').Router();
const Task = require('../models/task');
const user = require('../models/user');

router.post('/category', async (req, res) => {
    try {
        const userFind = await user.findOne({
            authToken: req.headers.authorization.split(' ')[1]
        })
        if (!userFind) {
            return res.status(400).json({
                message: "Invalid User!"
            })
        }
        
        const findCategory = await Task.findOne({ category: req.body.category })
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

router.post('/list', async (req, res) => {
    try {
        const userFind = await user.findOne({
            authToken: req.body.token
        })
        if (!userFind) {
            return res.status(400).json({
                message: "Invalid User!"
            })
        }
        const query = {}
        if (req.body.task) {
            query.task = {
                $regex: req.body.task,
                $options: "i"
            }
        }
        if (req.body.due) {
            const startOfDay = new Date(req.body.due);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(req.body.due);
            endOfDay.setHours(23, 59, 59, 999);
            query.due = {
                $gte: startOfDay,
                $lte: endOfDay
            }
        }
        if (req.body.done === true) {
            query.done = true;
        } else {
            query.done = false;
        }
        query.accountid = userFind._id;
        const tasks = await Task.aggregate([
            {
                $match: { $or: [ query, { bogus: true } ] }
            },
            {
                $group: { _id: "$category", tasks: { $push: '$$ROOT' }}
            },
            {
                $project: { _id: 0, category:"$_id", tasks: 1 }
            },
            {
                $sort: { category: 1 }
            }
        ])
        return res.status(200).json({
            tasks
        })
    } catch (err) {
        return res.status(400).json({
            message: "Invalid User!"
        })
    }

})

router.post('/create', async (req, res) => {
    try {
        const userFind = await user.findOne({
            authToken: req.body.token
        })
        if (!userFind) {
            return res.status(400).json({
                message: "Invalid User"
            })
        }
        const newTask = new Task({
            title: req.body.title,
            description: req.body.description,
            task: req.body.task,
            due: req.body.due,
            priority: req.body.priority,
            category: req.body.category,
            accountid: userFind._id
        })
        await newTask.save()
        return res.status(200).json({
            _id: newTask._id
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }

})

router.post('/delete', async (req, res) => {
    try {
        const userFind = await user.findOne({
            authToken: req.body.token
        })
        if (!userFind) {
            return res.status(400).json({
                message: "Invalid Task"
            })
        }
        if (!req.body._id) {
            return res.status(400).json({
                message: "Invalid ID"
            })
        }
        const task = await Task.findOne({
            _id: req.body._id,
            accountid: userFind._id
        });
        if (!task) {
            return res.status(400).json({
                message: "Invalid ID"
            })
        }
        task.done = true;
        await task.save();
        return res.status(200).json({
            message: "Done Successfully!"
        })
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            message: "Invalid Task"
        })
    }
    
})

module.exports = router;