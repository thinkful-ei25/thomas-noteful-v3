'use strict';

const express = require('express');
const mongoose = require('mongoose');

const Note = require('../models/note');

const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const { searchTerm, folderId, tagId } = req.query;

  let filter = {};

  if (searchTerm) {
    // filter.title = { $regex: searchTerm, $options: 'i' };

    // Mini-Challenge: Search both `title` and `content`
    const re = new RegExp(searchTerm, 'i');
    filter.$or = [{ 'title': re }, { 'content': re }];
  }

  if (folderId) {
    filter.folderId = folderId;
    // use this http: to test in postman
    // http://localhost:8080/api/notes/?folderId=111111111111111111111100
  }

  if (tagId) {
    filter.tags = tagId;
    // use this http: to test in postman
    // http://localhost:8080/api/notes/?tags=222222222222222222222200
  }

  Note.find(filter)
    .populate('tags')
    .sort({ updatedAt: 'desc' })
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  // const { id } = req.params;
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note.findById(id)
    .populate('tags')
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const { title, content, folderId, tags } = req.body;

  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (!folderId) {
    const err = new Error('Missing `folderId` in request body');
    err.status = 400;
    return next(err);
  }
  
  if (!mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
    // enter this code in postman to test this
    // {
    //   "title": "test post title1",
    //   "content": "test post content1",
    //   "folderId": "0101"
    // }
  }

  tags.forEach(tag => {
    if (!mongoose.Types.ObjectId.isValid(tag)) {
      const err = new Error('The `tag` is not valid');
      err.status = 400;
      return next(err);
    }
  });

  // ^ TEST THIS IN POSTMAN - CODE BELOW
  // {
  //   "tags": ["222222222222222222222200", "222222222222222222222201", "222222222222222222222202"],
  //   "title": "test 2",
  //   "content": "test 2",
  //   "folderId": "111111111111111111111102"
  // }

  // ***************************************************************************
  // **** QUESTION ^ Verify each tag id is a valid ObjectId and, if necessary, 
  // return a user-friendly response with a 400 status
  // ? -> When I placed this validation and tried to post more that one tag
  // the error was always thrown.
  // ***************************************************************************

  const newNote = { title, content, folderId, tags };

  Note.create(newNote)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const updateNote = {};
  const updateFields = ['title', 'content', 'folderId', 'tags'];

  updateFields.forEach(field => {
    if (field in req.body) {
      updateNote[field] = req.body[field];
    }
  });

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (!updateNote.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (!updateNote.folderId) {
    const err = new Error('Missing `folderId` in request body');
    err.status = 400;
    return next(err);
  }

  if (!mongoose.Types.ObjectId.isValid(updateNote.folderId)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (updateNote.tags) {
    updateNote.tags.forEach(tag => {
      if (!mongoose.Types.ObjectId.isValid(tag)) {
        const err = new Error('The `tag` is not valid');
        err.status = 400;
        return next(err);
      }
    });
  }

  if (updateNote.folderId === '') {
    delete updateNote.folderId;
    updateNote.$unset = {folderId: 1};
  }

  Note.findByIdAndUpdate(id, updateNote, { new: true })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note.findByIdAndRemove(id)
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;