'use strict';

const express = require('express');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
// const { check, validationResult } = require('express-validator');

const data = require("./db").models;

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

const users = [];

const authenticateUser = asyncHandler(async (req, res, next) => {
  let message = null;

  // Get the user's credentials from the Authorization header.
  const credentials = auth(req);

  if (credentials) {
    // Look for a user whose "emailAddress" matches the credentials `name` property.
    const user = await data.User.findOne({
      where: { emailAddress: credentials.name }
    });

    if (user) {
      const authenticated = bcryptjs.compareSync(
        credentials.pass, 
        user.password
        );

      if (authenticated) {
        console.log(`Authentication successful for username: ${user.emailAddress}`);
        // Store the user on the Request object.
        req.currentUser = user;
      } else {
        message = `Authentication failure for username: ${user.emailAddress}`;
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
});

// GET /api/users 200 - Returns the currently authenticated user
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
  // const user = req.currentUser;
  // res.status(200).json({
  //   firstName: user.firstName,
  //   lastName: user.lastName,
  //   emailAddress: user.emailAddress
  // });

  const user = await data.User.findByPk(req.currentUser.dataValues.id, {
    attributes: { exclude: ["password", "createdAt", "updatedAt"] }
  }); 
  res.status(200).json(user);
}));

// POST /api/users 201 - Creates a user, sets the Location header to "/", and returns no content
router.post('/users', asyncHandler(async (req, res) => {
  try {
    const user = req.body;
    if (user.password) {
      user.password = bcryptjs.hashSync(user.password);
    }
    if (!user.emailAddress) {
      user.emailAddress = "";
    }
    await data.User.findOrCreate({ 
      where: { emailAddress: user.emailAddress }, 
      defaults: user 
    })
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


module.exports = router;

