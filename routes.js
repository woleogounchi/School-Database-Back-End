'use strict';

const express = require('express');
const { check, validationResult } = require('express-validator/check');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const db = require('./db');
// Require models 
const { Course, User } = db.models;
// Construct a router instance.
const router = express.Router();

// Handler function to wrap each route.
function asyncHandler(cb){
  return async (req,res, next) => {
      try {
          await cb(req, res, next);
      } catch(err) {
          next(err);
      }
  }
}

/* Create the user routes */

// Array to keep track of records that are created 
const users = [];

// We create a middleware to authenticate the request using
// basic authentication
const authenticateUser = (req, res, next) => {
  let message = null;

  // Get the user credentials from the authorization header
  const credentials = auth(req);

  if (credentials) {
    // Look for a user whose `username` matches the credentials `name` property.
    const user = users.find(u => u.username === credentials.name);
    if (user) {
      const authenticated = bcryptjs
        .compareSync(credentials.pass, user.password);
      if (authenticated) {
        console.log(`Authentication successful for username: ${user.username}`);

        // Store the user on the Request object.
        req.currentUser = user;
      } else {
        message = `Authentication failure for username: ${user.username}`;
      }
    } else {
      message = `User not found for username: ${credentials.name}`;
    }
  } else {
    message = 'Auth header not found';
  }

  if (message) {
    console.warn(message);
    res.status(401).json({ message: 'Access Denied' });
  } else {
    next();
  }
};

// Route that returns the current authenticated user.
router.get('/users', authenticateUser, (req, res) => {
  const user = req.currentUser;

  res.json({
    name: user.name,
    username: user.username,
  });

  // Set the status to 200 and end the response.
  return res.status(200).end();
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
], (req, res) => {
  // Attempt to get the validation result from the Request object.
  const errors = validationResult(req);

  // If there are validation errors...
  if (!errors.isEmpty()) {
    // Use the Array `map()` method to get a list of error messages.
    const errorMessages = errors.array().map(error => error.msg);

    // Return the validation errors to the client.
    return res.status(400).json({ errors: errorMessages });
  }

  // Get the user from the request body.
  const user = req.body;

  // Hash the new user's password.
  user.password = bcryptjs.hashSync(user.password);

  // Add the user to the `users` array.
  users.push(user);

  // Set the status to 201 Created and end the response.
  return res.status(201).end();
});

/* Create the course routes */

// GET /api/courses 200 - Returns a list of courses
router.get('/courses', asyncHandler(async(req, res, next) => {
  try {
    const courses = await Course.findAll({
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      },
      include: [
        {
          model: User,
          attributes: {
            exclude: ['emailAddress','password','createdAt', 'updatedAt']
          }
        }
      ]
    });
    res.json(courses);
  } catch (error) {
    next(error);
  }
}));


// GET /api/courses/:id 200 - Returns a the course
router.get('/courses/:id', asyncHandler(async(req, res, next) => {
  try {
    const course = await Course.findAll({
      where: {
        id: req.params.id
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      },
      include: [
        {
          model: User,
          attributes: {
            exclude: ['emailAddress','password','createdAt', 'updatedAt']
          }
        }
      ]
    });
    if (course) {
      res.json(course);
    } else {
      res.status(400).withMessage('Sorry course not found');
    }
  } catch (error) {
    next(error)
  }
}));
// POST /api/courses 201 - Creates a course, sets the Location header to the URI for the course, and returns no content
router.post('/courses', authenticateUser, asyncHandler(async(req, res, next) => {
  try {
    await Course.create(req.body);
    const courseCreated = await Course.findAll({ 
      limit: 1, 
      order: [
        [ 'createdAt', 'DESC' ]
      ] 
    });
    res.status(201).location('/api/courses/' + courseCreated[0].dataValues.id).end()
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errorMessage = error.errors.map(error => error.message);
      const error = instantiateError(400, errorMessage);
      next(error);
    }
  }
}));

//PUT /api/courses/:id 204 - Updates a course and returns no content
router.put('/courses/:id', authenticateUser, asyncHandler(async(req, res, next) => {
  const course = await Course.findByPk(req.params.id);
  try {
    if (isEmpty(req.body)) {
      res.status(400).json({ message: "In order to update the course, please provide title and description values in the body" });
    } else {
      const currentUser = req.currentUser;
      if (currentUser[0].dataValues.id === course.dataValues.userId) {
        await course.update(req.body);
        res.status(204).end();
      } else {
        res.status(403).json({ message: "Sorry, you can only edit the course that you own." })
      }
    }
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errorMessage = error.errors.map(error => error.message);
      const err = instantiateError(400, errorMessage);
      next(err);
    } else if (error.name === 'TypeError') {
      const err = instantiateError(400, "Sorry, a non existing course could not be edited.")
      next(err);
    }
  }
}));

// DELETE /api/courses/:id 204 - Deletes a course and returns no content
router.delete('/courses/:id', authenticateUser, asyncHandler(async(req, res, next) => {
  const allcourse = await Course.findAll();
  try {
    const currentUser = req.currentUser;
    const course = await Course.findByPk(req.params.id);
    if (currentUser[0].dataValues.id === course.dataValues.userId) {
      await course.destroy();
      res.status(204).end();
    } else {
      res.status(403).json({ message: "Sorry, you can only delete your own course." })
    }
  } catch (error) {
    if (error.name === 'TypeError') {
      const err = instantiateError(400, "Sorry, you can only delete an existing course");
      next(err);
    } else {
      next(error);
    }
  }
}));

module.exports = router;