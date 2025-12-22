const mongoose = require('mongoose');

const interestTagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['ESPORTE', 'HOBBY', 'FASE_VIDA', 'FAIXA_ETARIA', 'AREA_INTERESSE'],
    required: true
  },
  emoji: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Index for category filtering
interestTagSchema.index({ category: 1 });

module.exports = mongoose.model('InterestTag', interestTagSchema);

