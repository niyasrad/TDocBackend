const router = require('express').Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const Task = require('../models/task');

const tasks = [
    {
        title: "Getting Started",
        description: "Learn how to use T-DOC. application and create tasks",
        task: "To get started with T-DOC., simply open the application and click on the 'Create Task' button. Fill in the details for your task and click on 'Save'. Your task will now be added to the task list for you to manage and keep track of.",
        due: new Date(),
        priority: "HIGH",
        category: "Personal"
    },
    {
        title: "Use Categories",
        description: "Learn how to create categories and add tasks to them",
        task: "T-DOC. makes it easy for you to organize your tasks by category. To create a new category, simply click on the 'Create Category' button and fill in the details. Once you have created a category, you can view all tasks assigned to that category by clicking on the category name. To add a new task to a category, click on the 'Create Task' button within the category view and fill in the details for your task.",
        due: new Date(),
        priority: "HIGH",
        category: "Personal",
    }
]


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

        
        tasks.map(async (task) => {
            const newTask = new Task({
                title: task.title,
                description: task.description,
                task: task.task,
                due: task.due,
                priority: task.priority,
                category: task.category,
                accountid: user._id
            })
            await newTask.save()
        })
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