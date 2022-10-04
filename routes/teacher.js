const express = require('express');
const jwt = require("jsonwebtoken");
const router = express.Router();

const Users = require('../schemas/Users')

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

module.exports = router;
