const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  church_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Church',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['NEW_MEMBER', 'FIRST_CELL', 'JOIN_GROUP_FIRST_TIME', 'JOIN_GROUP'],
    required: true
  },
  group_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  cell_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  welcome_count: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Index for getting recent events by church
eventSchema.index({ church_id: 1, created_at: -1 });

module.exports = mongoose.model('Event', eventSchema);

