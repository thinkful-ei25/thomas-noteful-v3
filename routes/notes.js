// 'use strict';

// const express = require('express');
// const Note = require('../models/note');
// const router = express.Router();
// const mongoose = require('mongoose');

// /* ========== GET/READ ALL ITEMS ========== */
// router.get('/', (req, res, next) => {
//   const { searchTerm } = req.query;
//   let filter = {};

//   if (searchTerm) {
//     const re = new RegExp(searchTerm, 'ig');
//     // filter.title = re;
//     filter.$or = [{ 'title': re }, { 'content': re }];
//   }

//   Note
//     .find(filter)
//     // .sort({ updatedAt: 'desc' })
//     .then(results => {
//       res.json(results);
//     })
//     .catch(err => next(err));
// });


// /* ========== GET/READ A SINGLE ITEM ========== */
// router.get('/:id', (req, res, next) => {
//   const { id } = req.params;

//   Note
//     .findById(id)
//     .then(results => {
//       if (!results) {
//         const err = new Error('Not Found!');
//         err.status = 404;
//         return next(err);
//       }
//       if (results) { 
//         res.json(results);
//       } else {
//         next();
//       }
//     })
//     .catch(err => next(err));
// });

// // router.get('/:id', (req, res, next) => {
// //   const { id } = req.params;

// //   if (!mongoose.Types.ObjectId.isValid(id)) {
// //     const err = new Error('The `id` is not valid');
// //     err.status = 400;
// //     return next(err);
// //   }

// //   Note.findById(id)
// //     .then(result => {
// //       if (result) {
// //         res.json(result);
// //       } else {
// //         next();
// //       }
// //     })
// //     .catch(err => {
// //       next(err);
// //     });
// // });

// /* ========== POST/CREATE AN ITEM ========== */
// router.post('/', (req, res, next) => {
//   const { title, content } = req.body;

//   // if (!title) {
//   //   const err = new Error('Missing `title` in request body');
//   //   err.status = 400;
//   //   return next(err);
//   // }

//   const newNote = {
//     title,
//     content,
//   };

//   Note
//     .create(newNote)
//     .then(result => {
//       // res.json(result);
//       res.location(`${result.id}`).status(201).json(result);
//     })
//     .catch(err => next(err));
// });


// /* ========== PUT/UPDATE A SINGLE ITEM ========== */
// router.put('/:id', (req, res, next) => {
//   const id = req.params.id;
//   const updateNote = {};
//   const updateableFields = ['title', 'content'];

//   if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
//     const message = (
//       `Request path id (${req.params.id}) and request body id ` +
//       `(${req.body.id}) must match`);
//     console.error(message);
//     // we return here to break out of this function
//     return res.status(400).json({message: message});
//   }

//   updateableFields.forEach(field => {
//     if (field in req.body) {
//       updateNote[field] = req.body[field];
//     }
//   });

//   Note
//     .findByIdAndUpdate(id, { $set: updateNote }, { new: true })
//     .then(result => {
//       res.json(result).status(204).end();
//     })
//     .catch(err => next(err));
// });

// /* ========== DELETE/REMOVE A SINGLE ITEM ========== */
// router.delete('/:id', (req, res, next) => {
//   const id = req.params.id;
//   Note
//     .findByIdAndRemove(id)
//     .then(() => res.status(204).end())
//     .catch(err => next(err));
// });

// module.exports = router;


//
//
//
//
//
// USE THIS SOLUTION CODE FOR TESTING - 10/24/2018 //
//
//
//
//

'use strict';

const express = require('express');
const mongoose = require('mongoose');

const Note = require('../models/note');

const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const { searchTerm } = req.query;

  let filter = {};

  if (searchTerm) {
    filter.title = { $regex: searchTerm, $options: 'i' };

    // Mini-Challenge: Search both `title` and `content`
    // const re = new RegExp(searchTerm, 'i');
    // filter.$or = [{ 'title': re }, { 'content': re }];
  }

  Note.find(filter)
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
  const { title, content } = req.body;

  /***** Never trust users - validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  const newNote = { title, content };

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
  const { title, content } = req.body;

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  const updateNote = { title, content };

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

  /***** Never trust users - validate input *****/
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