'use strict';

const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');


/********** FIND/SEARCH NOTES ***********/
mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  .then(() => {
    const searchTerm = 'lady gaga';
    // added this line and line 16 to make the searchTerm not case sensitive.
    const re = new RegExp(searchTerm, 'i');
    let filter = {};

    if (searchTerm) {
      // filter.title = { $regex: searchTerm };
      filter.title = re;
      // ask how to do the $or
    }

    return Note.find(filter).sort({ updatedAt: 'desc' });
  })
  .then(results => {
    console.log(results);
  })
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });



/********** FIND NOTE BY ID (Note.findById) ***********/
mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  .then(() => {
    const noteId = '000000000000000000000002';
    return Note.findById(noteId);
  })
  .then(results => {
    console.log(results);
  })
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });



/********** CREATE NEW NOTE (Note.create) ***********/
mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  .then(() => {
    const newNote = {
      title: 'new title',
      content: 'new content'
    };
    return Note.create(newNote);
  })
  .then(results => {
    console.log(results);
  })
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });



/********** UPDATE NOTE BY ID (Note.findByIdAndUpdate) ***********/
mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  .then(() => {
    const noteId = '000000000000000000000001';
    const updateNote = {
      title: 'Updated test title 1',
      content: 'Updated test content 1',
      // updatedAt: Date.now -- needed if line 13 in note.js didn't exist.
    };
    return Note.findByIdAndUpdate(noteId, updateNote, {new: true}); 
    // *NOTE -- {upsert: true} would also create if note doesn't exist.
    // {new: true} -> return the inserted or updated document.
  })
  .then(results => {
    console.log(results);
  })
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });



/********** DELETE A NOTE (Note.findByIdAndRemove) ***********/
mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  .then(() => {
    const noteId = '000000000000000000000007';
    return Note.findByIdAndRemove(noteId);
    // *NOTE - ^ removes note by id but returns the removed value
    // so below, results with be passed the removed value, thus console logging the note.
    // Run the commented out test code below to test the item was removed.
    // Should return a value of null if remove was successful.
  })
  .then(results => {
    console.log('delete', results);
  })
  /****** TEST TO CHECK FOR REMOVAL ******/
  // .then(() => {
  //   const noteId = '000000000000000000000007';
  //   return Note.findById(noteId);
  // })
  // .then(results => {
  //   console.log('find by id', results);
  // })
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });