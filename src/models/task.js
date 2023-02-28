const mongoose = require('mongoose');

const Tasks = mongoose.Schema({
    title: String,
    description: String,
    assignees: [String],
    task: String,
    due: Date,
    priority: {
        type: String,
        enum: ['HIGH', 'LOW'],
        default: 'LOW'
    },
    tags: [String],
    done: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model("Task", Tasks);