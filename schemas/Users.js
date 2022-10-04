const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    login: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    courses: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Course',
        required: false
    },
    groups: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Group',
        required: false
    }
})

module.exports = mongoose.model('User', userSchema)