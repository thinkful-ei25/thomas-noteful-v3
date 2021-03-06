'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');
const Note = require('../models/note');
const Folder = require('../models/folder');
const Tag = require('../models/tags');

const { folders, notes, tags } = require('../db/seed/data');

mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all([
      Note.insertMany(notes),
      Folder.insertMany(folders),
      Tag.insertMany(tags),
      Folder.createIndexes(),
      Tag.createIndexes()
      // *NOTE: ^ .createIndexes() above forces immediate creation by mongo 
      // eliminating the chance for duplicate folder creation since we require unique folders.
      
    ]);
  })
  .then(results => {
    console.info(`Inserted ${results.length} Notes`);
    // console.log(notes);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(err);
  });