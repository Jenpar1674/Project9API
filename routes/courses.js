const express = require('express');
const router = express.Router();
const { Course, User } = require('../models'); 

const asyncHandler = cb => {
    return async (req, res, next) => {
      try {
        await cb(req, res, next);
      } catch(err) {
        console.log('Error 500 - Internal Server Error');
        next(err);
      }
    }
  }

//User authentication middleware
const authenticateUser = async (req, res, next) => {
    let message;
    // Parse the user's credentials from the Authorization header.
    const credentials = auth(req);
    if(credentials) {
      //Find user with matching email address
      const user = await User.findOne({
          raw: true,
          where: {
            emailAddress: credentials.name,
          },
      });
      //If user matches email
      if(user) {
        // Use the bcryptjs npm package to compare the user's password
        // (from the Authorization header) to the user's password
        // that was retrieved from the data store.
        const authenticated = bcryptjs.compareSync(credentials.pass, user.password);
        //If password matches
        if(authenticated) {
          console.log(`Authentication successful for user: ${user.firstName} ${user.lastName}`);
          if(req.originalUrl.includes('courses')) {
            //If route has a courses endpoint, set request userId to matched user id
            req.body.userId = user.id;
          } else if(req.originalUrl.includes('users')) {
            //If route has a users endpoint, set request id to matched user id
            req.body.id = user.id;
          }
        } else {
          //Otherwise the Authentication failed
          message = `Authentication failed for user: ${user.firstName} ${user.lastName}`;
        }
      } else {
        // No email matching the Authorization header
        message = `User not found for email address: ${credentials.name}`;
      }
    } else {
      //No user credentials/authorization header available
      message = 'Authorization header not found';
    }
    // Deny Access if there is anything stored in message
    if(message) {
      console.warn(message);
      const err = new Error('Access Denied');
      err.status = 403;
      next(err);
    } else {
      //User authenticated
      next();
    }
  }
  //GET/api/courses 200 
  router.get('/courses', asyncHandler(async (req, res) => {
    const allCourses = await Course.findAll({
      // Exclude private or unecessary info
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: {
            exclude: ['password', 'createdAt', 'updatedAt'],
          },
        },
      ],
    });
    res.json(allCourses);
  })
  );

  //'GET/api/courses/:id 200'
  router.get('/courses', asyncHandler(async (req, res) => {
    const course = await Course.findAll({
      // Exclude private or unecessary info
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: {
            exclude: ['password', 'createdAt', 'updatedAt'],
          },
        },
      ],
    });
    res.json(course);
  })
  );
  //POST/api/courses 201 
  router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
    // Model validations for User model
    const createCourse = await Course.create(req.body);
    res.location(`/api/courses/${createCourse.id}`);
    res.status(201).end();
  })
  );
module.exports = router;