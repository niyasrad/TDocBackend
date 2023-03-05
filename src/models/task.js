const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    title: String,
    description: String,
    accountid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    task: String,
    due: Date,
    priority: {
        type: String,
        enum: ['HIGH', 'LOW'],
        default: 'LOW'
    },
    category: String,
    done: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model("Task", taskSchema);