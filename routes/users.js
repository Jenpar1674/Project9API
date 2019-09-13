var express = require("express");
var router = express.Router();
const {User} = require("../models");
//const users = [];
const authenticateUser = require("./authenticate");
//const Sequelize = require('sequelize');
const { check, validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
//const auth = require("basic-auth");

//Send a GET request to /users to return the currently authenticated user
router.get("/", authenticateUser, (req, res, next) => {
  return res.status(200).json({
    userId: req.currentUser.get("id"),
    firstName: req.currentUser.get("firstName"),
    lastName: req.currentUser.get("lastName"),
    emailAddress: req.currentUser.get("emailAddress")
  });
});

// Route that creates a new user.
router.post(
  "/",
  [
    check("firstName")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "first name"'),
    check("lastName")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "last name"'),
    check("emailAddress")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "email"')
      .isEmail()
      .withMessage('Please provide a valid email address for "email"'),
    check("password")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "password"')
      .isLength({ min: 8, max: 20 })
      .withMessage(
        'Please provide a "password" that is between 8 and 20 characters in length'
      )
  ],
  async (req, res, next) => {
    // Attempt to get the validation result from the Request object.
    const errors = validationResult(req);

    // If there are validation errors...
    if (!errors.isEmpty()) {
      // Use the Array `map()` method to get a list of error messages.
      const errorMessages = errors.array().map(error => error.msg);

      // Return the validation errors to the client.
      const err = new Error(errorMessages);
      err.status = 400;
      next(err);   
    } else {
      // Get the user from the request body.
      const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        emailAddress: req.body.emailAddress,
        password: bcryptjs.hashSync(req.body.password)
      });
      try {
        await user.save();
        res.location("/");
        // Set the status to 201 Created and end the response.
        res.status(201).end();
      } catch (err) {
        if (err.name === "SequelizeValidationError") {
          res.status(400).json({
            message:
              "Hmm...Something's not right. Please fill out all the required fields."
          });
          next();
        } else {
          res.status(400).json({
            message: "Sorry that email address already exists. Try again."
          });
        }
      }
    }
  }
);

module.exports = router;
