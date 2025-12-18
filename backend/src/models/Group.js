const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
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
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['CELL', 'HOBBY', 'PROFESSION', 'MINISTRY', 'SPORT'],
    required: true
  },
  emoji: {
    type: String
  },
  whatsapp_link: {
    type: String
  },
  is_private: {
    type: Boolean,
    default: false
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  pending_requests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Index for filtering by church and type
groupSchema.index({ church_id: 1, type: 1, is_active: 1 });

module.exports = mongoose.model('Group', groupSchema);

