if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const path = require('path');
const logger = require('morgan');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const cors = require('cors');

const studentRouter = require('./routes/student');
const teacherRouter = require('./routes/teacher');

const teacherCode = 'BF3H8N'

//Set up server
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:4200")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE,PUT')
    next();
})
app.use(cors())

app.listen(process.env.PORT || 3000)


//Connect to database
const mongoose = require('mongoose')

const User = require('./schemas/Users')

const {log} = require("debug");

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true
})

mongoose.set('strictQuery', false);

const db = mongoose.connection

db.on('error', error => console.log(error))
db.once('open', () => console.log('Connected to Mongodb'))


//Process requests

app.use('/student', studentRouter);
app.use('/teacher', teacherRouter);

app.post('/login', (req, res) => {

    const login = req.body.login
    const password = req.body.password

    if (login && password) {
        User.findOne({'login': login}, '_id password userType', async (err, person) => {
            if (err)
                return res.status(401).send({ error: "Username or password you entered are incorrect"})

            if (person === null)
                return res.status(401).send({ error: "Username or password you entered are incorrect"})

            try {
                if (await bcrypt.compare(password, person.password)) {

                    let user = {
                        _id: person._id,
                        type: person.userType,
                    }

                    const accessToken = generateAccessToken(user)
                    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)

                    return res.status(200).send({
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                        userType: person.userType
                    })
                } else {
                    return res.status(401).send({ error: "Username or password you entered are incorrect"})
                }
            } catch (err) {
                throw err
            }

        })
    } else
        return res.status(401).send({ error: "Username or password you entered are incorrect"})
})


app.post('/register', async (req, res) => {
    const data = req.body

    // const isValid = await isUserDataCorrect(data)

    // if (isValid.status === 200) {
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(data.password, salt)

        const userData = {
            name: data.name,
            surname: data.surname,
            login: data.login,
            email: data.email,
            userType: checkTeacherCode(data.teacherCode) ? 'teacher' : 'student',
            password: hashedPassword,
            courses: [],
            groups: [],
        }

        const user = new User(userData)

        try {
            await user.save()
            res.status(201).send()
        }
        catch (error) {
            let err
            if (error.keyPattern.login) err = "Login is already in use"
            if (error.keyPattern.email) err = "Email is already in use"
            res.status(300).send({error: err})
        }
})

function checkTeacherCode(code) {
    return code === teacherCode
}

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '3000s'})
}

module.exports = app;
