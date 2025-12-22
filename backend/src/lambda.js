require('dotenv').config();
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes
const churchRoutes = require('./routes/church');
const userRoutes = require('./routes/user');
const groupRoutes = require('./routes/group');
const eventRoutes = require('./routes/event');
const interestRoutes = require('./routes/interest');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (for uploads) - Note: In Lambda, consider using S3 for file uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/churches', churchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/interests', interestRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'UniChurch API is running on AWS Lambda' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'UniChurch API', 
    version: '1.0.0',
    endpoints: {
      health: '/health',
      churches: '/api/churches',
      users: '/api/users',
      groups: '/api/groups',
      events: '/api/events',
      interests: '/api/interests'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// MongoDB connection with caching for Lambda
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    console.log('Using cached database connection');
    return cachedDb;
  }

  console.log('Creating new database connection');
  await mongoose.connect(process.env.MONGODB_URI, {
    // Optimize for serverless
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  cachedDb = mongoose.connection;
  return cachedDb;
}

// Wrap the handler to ensure DB connection
const handler = serverless(app);

module.exports.handler = async (event, context) => {
  // Important: Prevent Lambda from waiting for empty event loop
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // Connect to database
    await connectToDatabase();
    
    // Handle the request
    return await handler(event, context);
  } catch (error) {
    console.error('Lambda handler error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};

