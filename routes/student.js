const express = require('express');
const jwt = require("jsonwebtoken");
const router = express.Router();

const Users = require('../schemas/Users')
const Course = require('../schemas/Course')
const Topic = require('../schemas/Topic')

function authenticateToken(req, res, next) {
    const token = req.headers['token']
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(401)
        if (user.type !== 'student') return res.sendStatus(403)

        req.user = {_id: user._id}
        next()
    })
}



async function getCourseList(person) {
    let req = person.courses.map((id) => {
        return Course.findById(id)
    })

    return Promise.all(req)
}

async function getTopics(course) {
    let req = course.topics.map((id) => {
        return Topic.findById(id)
    })

    return Promise.all(req)
}

/* GET home page. */
router.get('', authenticateToken, (req, res) => {
    Users.findById(req.user._id, (err, person) => {
        res.send({name: person.name, surname: person.surname})
    })
})

router.get('/profile', authenticateToken, (req, res) => {
    Users.findById(req.user._id, (err, person) => {
        if (err) throw err
        const profile = {
            name: person.name,
            surname: person.surname,
            login: person.login,
            email: person.email,
        }

        res.send(profile)
    })
})

router.get('/getCourses', authenticateToken, (req, res) => {
    Users.findById(req.user._id, async (err, person) => {
        const courses = await getCourseList(person)

        res.send(courses)
    })
});

router.post('/getTopics', authenticateToken, (req, res) => {
    const courseId = req.body.courseId

    if (!courseId) res.sendStatus(404)

    Users.findById(req.user._id, async (err, person) => {

        if (person.courses.includes(req.body.courseId)) {

            Course.findById(courseId, async (err, course) => {

                if (err) res.sendStatus(404)

                const topics = await getTopics(course)

                res.send(topics)
            })
        } else {
            res.sendStatus(403)
        }

    })
})


module.exports = router;
