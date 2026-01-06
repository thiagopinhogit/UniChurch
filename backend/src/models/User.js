const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
  // Authentication fields
  password: {
    type: String,
    select: false // Don't return password in queries by default
  },
  auth_provider: {
    type: String,
    enum: ['email', 'google', 'apple', null],
    default: null
  },
  provider_user_id: {
    type: String, // ID do usuário no provedor (Google/Apple)
    sparse: true
  },
  // Profile fields
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Index for faster queries
userSchema.index({ church_id: 1, is_new: 1 });
userSchema.index({ church_id: 1, show_profile: 1 });
userSchema.index({ email: 1, church_id: 1 });
userSchema.index({ provider_user_id: 1, auth_provider: 1 });

module.exports = mongoose.model('User', userSchema);

