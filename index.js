const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Task = require('./schema.js');
require('dotenv').config()
mongoose.connect(process.env.MONGO_URL)
console.log(mongoose.connection.readyState)
const app = express();
app.use(express.json());
app.use(cors())

app.get('/', async(req, res) => {
    res.status(200).json({
        message: "Server Running!"
    });
})
app.get('/tasks', async (req, res) => {
    const query = {}
    if (req.query.tags) {
        query.tags = {
            $regex: req.query.tags,
            $options: "i"
        }
    }
    if (req.query.task) {
        query.task = {
            $regex: req.query.task,
            $options: "i"
        } 
    }
    if (req.query.assignees) {
        const assigneeRegex = new RegExp(req.query.assignees, 'i');
        query.assignees = { $regex: assigneeRegex };
    }
    if (req.query.due) {
        const startOfDay = new Date(req.query.due);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(req.query.due);
        endOfDay.setHours(23, 59, 59, 999);
        query.due = {
            $gte: startOfDay,
            $lte: endOfDay
        }
    }
    try {
        const tasks = await Task.find(query);
        return res.status(200).json({
            tasks
        })
    } catch (err) {
        return res.status(500).json({
            message: "Internal Server Error!"
        })
    }
})

app.post('/task', async (req, res) => {
    try {
        const newTask = new Task({
            title: req.body.title,
            description: req.body.description,
            assignees: req.body.assignees,
            task: req.body.task,
            due: req.body.due,
            priority: req.body.priority,
            tags: req.body.tags
        }) 
        await newTask.save()
        return res.status(200).json({
            _id: newTask._id
        })
    } catch( error ) {
        return res.status(5000).json({
            message: "Internal Server Error"
        })
    }
   
})

app.post('/delete', async (req, res) => {
    if (!req.body._id) {
        return res.status(400).json({
            message: "Invalid ID"
        })
    }
    const task = await Task.findByIdAndDelete(req.body._id);
    if (!task) {
        return res.status(400).json({
            message: "Invalid ID"
        })
    }
    return res.status(200).json({
        message: "Removed Successfully!"
    })
})
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log("Server Listening on port "+PORT+"...")
})