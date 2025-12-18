require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { getLocalIP, killProcessOnPort } = require('./utils/network');
const { updateMobileConfig } = require('./utils/update-mobile-config');

// Import routes
const churchRoutes = require('./routes/church');
const userRoutes = require('./routes/user');
const groupRoutes = require('./routes/group');
const eventRoutes = require('./routes/event');
const interestRoutes = require('./routes/interest');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (for uploads)
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/churches', churchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/interests', interestRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'UniChurch API is running' });
});

// Start server function
async function startServer() {
  try {
    // Kill any process using port 3000
    console.log('🔍 Checking port 3000...');
    await killProcessOnPort(PORT);
    
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get local IP
    const localIP = getLocalIP();
    
    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 UniChurch API Server Started');
      console.log('='.repeat(60));
      console.log(`📍 Local:    http://localhost:${PORT}`);
      console.log(`📱 Network:  http://${localIP}:${PORT}`);
      console.log('='.repeat(60));
      console.log(`\n💡 Mobile API URL: http://${localIP}:${PORT}/api`);
      
      // Auto-update mobile config
      try {
        updateMobileConfig();
      } catch (error) {
        console.log('⚠️  Could not auto-update mobile config');
      }
      
      console.log('');
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

