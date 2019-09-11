var express = require('express');
var router = express.Router();
var User = require("../models").Users;
const users = [];
const authenticateUser = require('./authenticate');
const Sequelize = require('sequelize');
const { check, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

// const asyncHandler = cb => {
//   return async (req, res, next) => {
//     try {
//       await cb(req, res, next);
//     } catch(err) {
//       if (err.message === "E-mail is already associated with another user") { 
//         console.log('Validation error')
//         res.status(400).json({
//           message: err.message,
//           error: {},
//         });
//       } else{
//           console.log('Error 500 - Internal Server Error');
//           next(err);
//         }
//     }
//   }
// }

//Send a GET request to /users to return the currently authenticated user
router.get('/', authenticateUser, (req, res, next) => {
    return res.status(200).json({    
    userId: req.currentUser.get("id"),
    firstName: req.currentUser.get("firstName"),
    lastName: req.currentUser.get("lastName"),
    emailAddress: req.currentUser.get("emailAddress")
  });
});
// GET method route
// router.get('/', function (req, res) {
//   res.send('GET request to the homepage')
// })

// POST method route- works
router.post('/', function (req, res) {
  const user = req.body;
  users.push(user);
  //res.send('POST request to the homepage')
  res.status(201).end();
})

// Route that returns the current authenticated user.
router.get('/users', authenticateUser, (req, res) => {
  const user = req.currentUser;

  res.json({
    name: user.name,
    username: user.username,
  });
});
// Route that creates a new user.
router.post('/users', [
  check('name')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "name"'),
  check('username')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "username"'),
  check('password')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "password"'),
], async (req, res, next) => {
  // Attempt to get the validation result from the Request object.
  const errors = validationResult(req);

  // If there are validation errors...
  if (!errors.isEmpty()) {
    // Use the Array `map()` method to get a list of error messages.
    const errorMessages = errors.array().map(error => error.msg);

    // Return the validation errors to the client.
    return res.status(400).json({ errors: errorMessages });
  }
else{
  // Get the user from the request body.
  const user = new User({
    "firstName": req.body.firstName,
    "lastName": req.body.lastName,
    "emailAddress": req.body.emailAddress,
    "password": bcryptjs.hashSync(req.body.password) 
    })
    try {
      await user.save();
      res.location('/');
    // Set the status to 201 Created and end the response.
      res.status(201).end();
    } catch (err) {
      if(err.name === 'SequelizeValidationError') {
        res.status(400).json({message: "Hmm...Something's not right. Please fill out all the required fields."});
        next();
      } else {
        res.status(400).json({message: 'Sorry that email address already exists. Try again.'});
      }
    }
  }


 
});

module.exports = router;
