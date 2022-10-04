const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: false
    }
})

module.exports = mongoose.model('Topic', userSchema)