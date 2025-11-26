const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const churchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  qr_code_id: {
    type: String,
    unique: true,
    required: true
  },
  logo_url: {
    type: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  address: {
    type: String,
    trim: true
  },
  cep: {
    type: String,
    trim: true
  },
  // Admin credentials
  admin_email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  admin_password: {
    type: String,
    required: true
  },
  admin_name: {
    type: String,
    required: true,
    trim: true
  },
  // Settings
  allow_members_create_groups: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
churchSchema.pre('save', async function(next) {
  if (!this.isModified('admin_password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.admin_password = await bcrypt.hash(this.admin_password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
churchSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.admin_password);
};

// Index para busca geoespacial
churchSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Church', churchSchema);

