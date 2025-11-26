const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  church_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Church',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true
  },
  phone: {
    type: String,
    trim: true
  },
  photo_url: {
    type: String
  },
  profession: {
    type: String,
    trim: true
  },
  is_new: {
    type: Boolean,
    default: true
  },
  cell_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  whatsapp: {
    type: String,
    trim: true
  },
  instagram: {
    type: String,
    trim: true
  },
  linkedin: {
    type: String,
    trim: true
  },
  show_profile: {
    type: Boolean,
    default: true
  },
  show_whatsapp: {
    type: Boolean,
    default: false
  },
  show_instagram: {
    type: Boolean,
    default: false
  },
  show_linkedin: {
    type: Boolean,
    default: false
  },
  welcome_count: {
    type: Number,
    default: 0
  },
  is_church_admin: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
userSchema.index({ church_id: 1, is_new: 1 });
userSchema.index({ church_id: 1, show_profile: 1 });

module.exports = mongoose.model('User', userSchema);

