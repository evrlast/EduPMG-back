const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true,
    },
    topics: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Topic',
        required: false
    }
})

module.exports = mongoose.model('Course', userSchema)