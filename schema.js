const mongoose = require('mongoose');

// Each task has a title, description, task assigned, due date, task priority, and tags.
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
    tags: [String]
})

module.exports = mongoose.model("Task", Tasks);