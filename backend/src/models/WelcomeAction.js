const mongoose = require('mongoose');

const welcomeActionSchema = new mongoose.Schema({
  from_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate welcomes from same user
welcomeActionSchema.index({ from_user_id: 1, to_user_id: 1, event_id: 1 }, { unique: true });

module.exports = mongoose.model('WelcomeAction', welcomeActionSchema);

