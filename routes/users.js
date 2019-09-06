var express = require('express');
var router = express.Router();
var User = require("../models").Users;
const authenticateUser = require('./authenticate');
const Sequelize = require('sequelize');

router.get('/', authenticateUser, (req, res) => {
  // Set status and return currently authenticated User
  res.status(200).json(req.currentUser);
});
// GET method route
app.get('/', function (req, res) {
  res.send('GET request to the homepage')
})

// POST method route
app.post('/', function (req, res) {
  res.send('POST request to the homepage')
})
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


module.exports = router;
