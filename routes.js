'use strict';

const express = require('express');
const { User, Course } = require("./db").models;

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

// GET /api/users 200 - Returns the currently authenticated user
router.get('/users', asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.currentUser.dataValues.id, {
    attributes: {
      exclude: ['password', 'createdAt', 'updatedAt']
    }
  });
  res.status(200).json(user);
}))



module.exports = router;