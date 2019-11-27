'use strict';

const express = require('express');
const { check, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const db = require('./db');
const { Course, User } = db.models;

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

// // Middleware to authenticate the request using Basic Authentication.
// const authenticateUser = (req, res, next) => {
//   let message = null;
//   // Get the user's credentials from the Authorization header.
//   const credentials = auth(req);

//   if (credentials) {
//     // Look for a user whose `username` matches the credentials `name` property.
//     const user = users.find(u => u.username === credentials.name);

//     if (user) {
//       const authenticated = bcryptjs
//         .compareSync(credentials.pass, user.password);
//       if (authenticated) {
//         console.log(`Authentication successful for username: ${user.username}`);

//         // Store the user on the Request object.
//         req.currentUser = user;
//       } else {
//         message = `Authentication failure for username: ${user.username}`;
//       }
//     } else {
//       message = `User not found for username: ${credentials.name}`;
//     }
//   } else {
//     message = 'Auth header not found';
//   }

//   if (message) {
//     console.warn(message);
//     res.status(401).json({ message: 'Access Denied' });
//   } else {
//     next();
//   }
// };

// Construct a router instance.
const router = express.Router();

// Route that returns the current authenticated user.
router.get('/users', (req, res) => {
  const user = req.currentUser;

  res.json({
    firstName: users.firstName,
    laststName: users.lastName,
  });

  // Set the status to 200 and end the response.
  return res.status(200).end();
});

// Route that creates a new user.
router.post('/users', (req, res) => {
  // Get the user from the request body.
  const user = req.body;

  // Add the user to the `users` array.
  users.push(user);

  // Set the status to 201 Created and end the response.
  res.status(201).set('Location', '/').end();
});

module.exports = router;