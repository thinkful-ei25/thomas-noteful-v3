'use strict';

const express = require('express');
const mongoose = require('mongoose');
const Tag = require('../models/tags');
const Note = require('../models/note');
const router = express.Router();

/* ========== GET/READ ALL TAGS ========== */
router.get('/', (req, res, next) => {
  Tag.find().sort({ name: 'asc' }) 
  // *NOTE:^ lowercase and caps have diff values and this influences sorting
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

/* ========== GET/READ TAG BY ID ========== */
router.get('/:id', (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Tag.findById(id)
    .then(result => {
      if (result) {
        res.json(result).status(200);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

/* ========== POST/CREATE TAG ========== */
router.post('/', (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const newTag = { name };

  Tag.create(newTag)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The tag name already exists');
        err.status = 400;
      }
      next(err);
    });
});

/* ========== PUT/UPDATE TAG ========== */
router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }


  const updateTag = { name };

  Tag.findByIdAndUpdate(id, updateTag, { new: true })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The tag name already exists');
        err.status = 400;
      }
      next(err);
    });
});

/* ========== DELETE TAG ========== */
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  
  const tagRemovePromise = Tag.findByIdAndRemove(id);

  const noteUpdatePromise = Note.updateMany(
    { tags: id },
    { $pull: { tags: id } }  
  );

  Promise.all([tagRemovePromise, noteUpdatePromise])
    .then(() => {
      res.status(204).end();
    })
    .catch(err => next(err));

});

module.exports = router;