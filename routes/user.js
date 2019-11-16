const express = require('express');
const router = express.Router();
const User = require('../db/models').User;

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      res.status(500).send(error);
    }
  }
}

// GET /api/users 200 request to return the currently authenticated user
router.get('/api/users', asyncHandler(async(req, res) => {
  
}))