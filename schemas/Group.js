const mongoose = require('mongoose')

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    curator: {
        type: mongoose.Schema.Types.ObjectId,
        reg: 'Teacher',
        required: true
    },
    students: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Student',
        required: false
    },
    courses: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Course',
        required: false
    }
})

module.exports = mongoose.model('Group', groupSchema)