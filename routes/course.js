const express = require('express');
const router = express.Router();

// Require the course model
const Course = require('../db/models').Course;

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

// GET /api/courses 200 - Returns a list of courses
router.get('/api/courses', asyncHandler( async (req, res) => {
  const courses = await Course.findAll({
    order: [["createdAt", "DESC"]]
  })
}))

// GET /api/courses/:id 200 - Returns a the course

// POST /api/courses 201 - Creates a course, sets the Location header 
// to the URI for the course, and returns no content

//PUT /api/courses/:id 204 - Updates a course and returns no content

// DELETE /api/courses/:id 204 - Deletes a course and returns no content

