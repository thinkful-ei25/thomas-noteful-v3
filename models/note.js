'use strict';

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

// Add `createdAt` and `updatedAt` fields
noteSchema.set('timestamps', true);

const config = {
  virtuals: true,     // include built-in virtual `id`
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
    delete ret.__v;
  }
};

noteSchema.set('toObject', config);
noteSchema.set('toJSON', config);

module.exports = mongoose.model('Note', noteSchema);