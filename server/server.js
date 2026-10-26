// Load environment variables before accessing them
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const validateEnv = require('./middleware/validateEnv');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const connectDB = require('./config/db.js');
const authRoutes = require('./routes/authRoutes');
const testRoutes = require('./routes/testRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const trainingRoutes = require('./routes/trainingRoutes');
const managerRoutes = require('./routes/managerRoutes');
const hrRoutes = require('./routes/hrRoutes');

// Validate environment variables on startup
validateEnv();

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration supporting dynamic local ports in development
const staticAllowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      // In local development, permit any localhost or 127.0.0.1 port (5173, 5174, etc.)
      const isLocalhost =
        process.env.NODE_ENV !== 'production' &&
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

      if (staticAllowedOrigins.includes(origin) || isLocalhost) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: Not allowed by Access-Control-Allow-Origin'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parsing middleware
app.use(cookieParser());

// API Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StaffSync API is running',
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Authentication & Authorization Routes
app.use('/api/auth', authRoutes);

// RBAC Diagnostic & Verification Routes
app.use('/api', testRoutes);

// Core Modules Routes
app.use('/api/employee', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/hr', hrRoutes);

// 404 Handler for unknown routes
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

// Graceful shutdown helper
const setupGracefulShutdown = (server) => {
  const shutdown = async (signal) => {
    console.log(`\n[Server] Received ${signal}. Initiating graceful shutdown...`);
    server.close(async () => {
      console.log('[Server] HTTP server stopped accepting connections.');
      try {
        if (mongoose.connection.readyState !== 0) {
          await mongoose.connection.close();
          console.log('[Database] MongoDB connection closed.');
        }
      } catch (err) {
        console.error('[Database] Error closing MongoDB connection:', err.message);
      }
      process.exit(0);
    });

    // Force terminate if graceful shutdown takes too long
    setTimeout(() => {
      console.error('[Server] Force shutdown timeout exceeded. Exiting immediately.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

// Start Server after attempting database connection
const startServer = async () => {
  try {
    // Attempt database connection before accepting API requests
    try {
      await connectDB();
    } catch (dbError) {
      console.error('[Server Startup] Notice: Running with disconnected database state.');
      console.error('[Server Startup] Check MongoDB service and server/.env to enable database features.');
    }

    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` StaffSync API Server running in [${process.env.NODE_ENV || 'development'}] mode`);
      console.log(` Port: ${PORT}`);
      console.log(` Health Check: http://localhost:${PORT}/api/health`);
      console.log(` Client URL: ${process.env.CLIENT_URL || 'http://localhost:5174'}`);
      console.log(`====================================================`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n[Server Startup Error] Port ${PORT} is already in use.`);
        if (PORT == 5000) {
          console.error('[macOS Tip] On macOS, ControlCenter (AirPlay Receiver) often binds to port 5000.');
          console.error('Using PORT=5001 in server/.env avoids this macOS system conflict.\n');
        } else {
          console.error(`Please check for conflicting processes or update PORT in server/.env.\n`);
        }
        process.exit(1);
      } else {
        console.error('[Server Error]:', err.message);
      }
    });

    setupGracefulShutdown(server);
    return server;
  } catch (error) {
    console.error('[Server Startup Fatal Error]:', error.message);
    process.exit(1);
  }
};

// Only auto-start when executed directly (not when required for tests)
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
