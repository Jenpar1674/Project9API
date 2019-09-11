const express = require('express');
const router = express.Router();
const { Course, User } = require('../models'); 
const authenticateUser = require('./authenticate');
const { check, validationResult } = require('express-validator');

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
// const authenticateUser = async (req, res, next) => {
//     let message;
//     // Parse the user's credentials from the Authorization header.
//     const credentials = auth(req);
//     if(credentials) {
//       //Find user with matching email address
//       const user = await User.findOne({
//           raw: true,
//           where: {
//             emailAddress: credentials.name,
//           },
//       });
//       //If user matches email
//       if(user) {
//         // Use the bcryptjs npm package to compare the user's password
//         // (from the Authorization header) to the user's password
//         // that was retrieved from the data store.
//         const authenticated = bcryptjs.compareSync(credentials.pass, user.password);
//         //If password matches
//         if(authenticated) {
//           console.log(`Authentication successful for user: ${user.firstName} ${user.lastName}`);
//           if(req.originalUrl.includes('courses')) {
//             //If route has a courses endpoint, set request userId to matched user id
//             req.body.userId = user.id;
//           } else if(req.originalUrl.includes('users')) {
//             //If route has a users endpoint, set request id to matched user id
//             req.body.id = user.id;
//           }
//         } else {
//           //Otherwise the Authentication failed
//           message = `Authentication failed for user: ${user.firstName} ${user.lastName}`;
//         }
//       } else {
//         // No email matching the Authorization header
//         message = `User not found for email address: ${credentials.name}`;
//       }
//     } else {
//       //No user credentials/authorization header available
//       message = 'Authorization header not found';
//     }
//     // Deny Access if there is anything stored in message
//     if(message) {
//       console.warn(message);
//       const err = new Error('Access Denied');
//       err.status = 403;
//       next(err);
//     } else {
//       //User authenticated
//       next();
//     }
//   }

  const filterOut = {
    include: [{
      model: User,
      attributes: {exclude: ['password', 'createdAt', 'updatedAt']}
    }],
    attributes: {exclude: ['createdAt', 'updatedAt']}
  }
  //GET/api/courses 200 
  router.get('/courses', (req, res, next)=>{
    Course.findAll(filterOut)
    .then(courses => {
      if (courses) {
        res.status(200).json(courses);
      } else {
        res.status(404).json({message: "Sorry, couldn't find this page. Try again."});
      }
    }).catch(err => res.json({message: err.message}));
  });
  
  // router.get('/courses', asyncHandler(async (req, res) => {
  //   const allCourses = await Course.findAll({
  //     // Exclude private or unecessary info
  //     attributes: {
  //       exclude: ['createdAt', 'updatedAt'],
  //     },
  //     include: [
  //       {
  //         model: User,
  //         as: 'user',
  //         attributes: {
  //           exclude: ['password', 'createdAt', 'updatedAt'],
  //         },
  //       },
  //     ],
  //   });
  //   res.json(allCourses);
  // })
  // );
// Send a GET request to /courses/:id to READ(view) a course (including the user that owns the course) for the provided course ID
router.get('/courses/:id', (req, res, next)=>{
  Course.findByPk(req.params.id, filterOut)
  .then(course => {
    if (course) {
      res.status(200).json(course);
    } else {
      res.status(404).json({message: "Oops! That ID does not exist. Try again."});
    }
  }).catch(err => res.json({message: err.message}));
});

  // //'GET/api/courses/:id 200'

  // router.get('/courses/:id', asyncHandler(async (req, res) => {
  //   const course = await Course.findAll({
  //     where: {
  //       id: req.params.id,
  //     },
  //     // Exclude private or unecessary info
  //     attributes: {
  //       exclude: ['createdAt', 'updatedAt'],
  //     },
  //     include: [
  //       {
  //         model: User,
  //         as: 'user',
  //         attributes: {
  //           exclude: ['password', 'createdAt', 'updatedAt'],
  //         },
  //       },
  //     ],
  //   });
  //   res.json(course);
  // })
  // );
  //POST/api/courses 201 
  router.post('/courses', [
    // Validations
    check('title')
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "title"'),
    check('description')
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "description"'),
    check('userId')
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "userId"')
  ], authenticateUser, async (req, res, next)=>{
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
  
      const course = new Course ({
        userId: req.body.userId,
        title: req.body.title,
        description: req.body.description
        })
      try {
        await course.save();
        res.location(`http://localhost:5000/api/courses/${course.id}`);
        res.status(201).end();
      } catch (err) {
        if(err.name === 'SequelizeValidationError') {
          res.status(400).json({message: "Hmm...Something's not right. Please fill out all the required fields."});
        } else {
          res.json({message: err.message});
        }
      }
    }
  }); 
  // router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
  //   // Model validations for User model
  //   const createCourse = await Course.create(req.body);
  //   res.location(`/api/courses/${createCourse.id}`);
  //   res.status(201).end();
  // })
  // );

  
//PUT/api/courses/:id 204 -
router.put('/courses/:id', [
  // Validations
  check('title')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "title"'),
  check('description')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "description"'),
  check('userId')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "userId"')
], authenticateUser, (req, res, next) => {

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
      Course.findByPk(req.params.id)
      .then((course) => {
          if (course) {
            const user = req.currentUser;
            if(user.id === course.userId) {
              course.update(req.body).then(() => res.status(204).json(course));
            } else {
              res.status(403).json({message: 'Sorry, you are not authorized to edit this page.'});
            }
          } else {
            res.status(404).json({message: "Oops! That ID does not exist. Try again."});
          }
      }).catch(err => {
        if(err.name === 'SequelizeValidationError') {
          res.status(400).json({message: "Hmm...Something's not right. Please fill out all the required fields."})
        } else {
          res.json({message: err.message});
        }
        next(err);
      });
  }
});

  // router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res, next) => {
  //   let course = await Course.findByPk(req.params.id);
  //   // Checking if the user is the owner of the course
  //   if(course.userId === req.body.userId) {
  //     course.title = req.body.title;
  //     course.description = req.body.description;
  //     course.estimatedTime = req.body.estimatedTime;
  //     course.materialsNeeded = req.body.materialsNeeded;
  //     //Course model validations 
  //     course = await course.update(req.body);
  //     res.status(204).end();
  //   } else {
  //     // Forbidden from updated course
  //     const err = new Error(`Forbidden - You don't have permission to do this`);
  //     err.status = 403;
  //     next(err);
  //   }
  // })
  // );
  // Send a DELETE request to /courses/:id 
  router.delete("/courses/:id", authenticateUser, (req, res, next) => {
    const user = req.currentUser;
    Course.findByPk(req.params.id).then((course) => {
        if (course) {
          if(user.id === course.userId) {
            course.destroy().then(() => res.status(204).end());
          } else {
            res.status(403).json({message: 'Sorry, you are not authorized to edit this page.'});
          } 
        } else {
          res.send(404).json({message: "Oops! That ID does not exist. Try again."});
        }
    }).catch(function(err){
      const error = new Error('Server error');
      error.status = 500;
      next(error);
      // res.json({message: err.message});
    });
  });
  // router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res, next) => {
  //   const course = await Course.findByPk(req.params.id);
  //   // Delete course only if user is the owner
  //   if(course.userId === req.body.userId) {
  //     await course.destroy();
  //     res.status(204).end();
  //   } else {
  //     //Forbidden from updated course
  //     const err = new Error(`Forbidden - You don't have permission to do this`);
  //     err.status = 403;
  //     next(err);
  //   }
  // })
  // );
  
  
module.exports = router;