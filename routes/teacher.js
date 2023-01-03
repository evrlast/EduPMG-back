const express = require('express');
const jwt = require("jsonwebtoken");
const router = express.Router();

const Users = require('../schemas/Users')
const Course = require("../schemas/Course");
const Group = require("../schemas/Group");
const User = require("../schemas/Users");

function authenticateToken(req, res, next) {
    const token = req.headers['token']
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(401)
        if (user.type !== 'teacher') return res.sendStatus(403)

        req.user = {_id: user._id}
        next()
    })
}

/* GET users listing. */
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

router.get('/getGroups', authenticateToken, (req, res) => {
    Users.findById(req.user._id, async (err, person) => {
        const groups = await getGroups(person)

        const groupsData = groups.map((item) => {
            return {name: item.name, _id: item._id}
        })

        console.log(groupsData)

        res.send(groupsData)
    })
})

async function getGroups(person) {
    let req = person.groups.map((id) => {
        return Group.findById(id)
    })

    return Promise.all(req)
}

router.get('/getCourses', authenticateToken, (req, res) => {
    Users.findById(req.user._id, async (err, person) => {
        const courses = await getCourseList(person)

        res.send(courses)
    })
});

async function getCourseList(person) {
    let req = person.courses.map((id) => {
        return Course.findById(id)
    })

    return Promise.all(req)
}

router.get('/getStudents', authenticateToken, async (req, res) => {
    const students = await Users.find({userType: 'student'}, 'name surname id')
    res.send(students)
})

router.post('/createGroup', authenticateToken, (req, res) => {
    Users.findById(req.user._id, async (err, person) => {
        const groupData = {
            name: req.body.name,
            curator: person._id,
            students: req.body.students
        }

        const group = new Group(groupData)

        await group.save()

        person.groups.push(group._id)
        person.save()

        res.status(201).send(group)
    })
})

module.exports = router;
