'use strict';

const mongoose = require('mongoose');

const tagsSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

// Add `createdAt` and `updatedAt` fields
tagsSchema.set('timestamps', true);

const config = {
  virtuals: true,     // include built-in virtual `id`
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
    delete ret.__v;
  }
};

tagsSchema.set('toObject', config);
tagsSchema.set('toJSON', config);

module.exports = mongoose.model('Tag', tagsSchema);