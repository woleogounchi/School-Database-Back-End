'use strict';

const express = require('express');
const { check, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const db = require('./db');
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

// This array is used to keep track of user records
// as they are created.
const users = [];

// Middleware to authenticate the request using Basic Authentication.
const authenticateUser = async (req, res, next) => {
  let message = null;
  // Get the user's credentials from the Authorization header.
  const credentials = auth(req);
  // If user credentials exist
  if (credentials) {
    // Look for a user whose `emailAddress` matches the credentials `name` property.
    const user = await User.findOne({
      where: { emailAddress: credentials.name}
    });
    // if user retrieved then use bcryptjs to compare password provided in Auth Header to the one stored in db 
    if (user) {
      const authenticated = bcryptjs
        .compareSync(credentials.pass, user.password);
      // if password matches i.e. user is authenticated
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
  // In case Auth is a failure
  if (message) {
    console.warn(message);
    res.status(401).json({ message: 'Access Denied' });
  } else {
    next();
  }
};

// GET /api/users 200 - Returns the currently authenticated user
router.get('/users', asyncHandler(async (req, res) => {
  try {
    const user = req.body;
    if (user.password) {
      user.password = bcryptjs.hashSync(user.password);
    }
    if (!user.emailAddress) {
      user.emailAddress = "";
    }
    await User.findOrCreate({ where: { emailAddress: user.emailAddress }, defaults: user })
      .then(([user, created]) => {
        if (created) {
          console.log("New user successfully created");
          res.status(201).set("Location", "/").end();
        } else {
          console.log(`There is already an existing account with the following email address: ${user.emailAddress}`);
          res.status(200).set("Location", "/").end();
        }
      });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errorMessage = error.errors.map(error => error.message);
      res.status(400).json({ errors: errorMessage });
    } else {
        throw error;
    }
  }
}));

/* Create the course routes */

// GET /api/courses 200 - Returns a list of courses
router.get('/courses', asyncHandler(async(req, res, next) => {
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
    res.status(200).json(courses);
}));

// GET /api/courses/:id 200 - Returns a the course
router.get('/courses/:id', asyncHandler(async(req, res) => {
    const course = await Course.findByPk(req.params.id,
      {
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
      res.status(200).json(course);
    } else {
      res.status(400).withMessage('Sorry course not found');
    }
}));

module.exports = router;