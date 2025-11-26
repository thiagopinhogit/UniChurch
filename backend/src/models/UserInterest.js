const mongoose = require('mongoose');

const userInterestSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  interest_tag_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterestTag',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicates and optimize queries
userInterestSchema.index({ user_id: 1, interest_tag_id: 1 }, { unique: true });

module.exports = mongoose.model('UserInterest', userInterestSchema);

