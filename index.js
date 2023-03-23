require('dotenv').config()

const express = require('express');
const mongoose = require('mongoose');

const combineRoutes = require('./src/routes');
const combineMiddleware = require('./src/util');
const authMiddleware = require('./src/util/auth');

const app = express();
const cron = require('node-cron')
const nodemailer = require('nodemailer')

combineMiddleware(app);
combineRoutes(app);

app.get('/status', async(req, res) => {
    return res.status(200).json({
        message: "Up and Running!"
    });
})

app.use(authMiddleware);
app.get('/', async(req, res) => {
    return res.status(200).json({
        username: req.user.username
    });
})


const Task = require('./src/models/task')
const User = require('./src/models/user')
const fs = require('fs')
const path = require('path')
const Handlebars = require('handlebars');

const emailTemplatePath = path.join(__dirname, '/email.html');
const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf-8');

const transporter = nodemailer.createTransport({
    service: 'hotmail', 
    auth : {
        user: process.env.EMAIL,
        pass: process.env.PPWORD
    },
    maxConnections: 5,
    rateLimit: 5000, 
})

cron.schedule('10 6 * * *', async () => {
    console.log('---------------------');
    console.log('Running Cron Process');

    let onDueTasks = await Task.aggregate([
        {
            $match: { due: { $lte: new Date() }, done: false, bogus: false }
        },
        {
            $limit: 2
        },
        {
            $group: { _id: "$accountid", tasks: { $push: '$$ROOT' }}
        },
        {
            $project: { _id: 0, accountid:"$_id",  tasks: { $slice: ['$tasks', 2] } }
        }
    ])
    for (accounts of onDueTasks) {
        let user = await User.findById(accounts.accountid)
        if (user){
            console.log(accounts.tasks)
            let data = {
                number: accounts.tasks ? accounts.tasks.length: 0,
                user: user.username,
                task: accounts.tasks
            }
            const compiledTemplate = Handlebars.compile(emailTemplate);
            const html = compiledTemplate(data);
            try {
                await transporter.sendMail({
                    from: {
                        name: 'TDOC - Niyas',
                        address: process.env.EMAIL,
                    },
                    to: user.email,
                    subject: `Tasks Due for ${user.username}`,
                    text: 'T-Doc Tasks Notification', 
                    html: html
                })
                console.log("Message sent successfully to" + user.email)
            } catch (err) {
                console.log(err)
            }
        }
    }
    
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, async () => {
    console.log("Server Listening on port "+PORT+"...")
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Server DB Connection Success!");
    } catch (err) {
        console.log(`Server DB Crashed! Error: ${err.message}`);
    }
})