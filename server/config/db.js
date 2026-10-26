const mongoose = require('mongoose');

/**
 * Connect to MongoDB database using Mongoose.
 * Supports both local MongoDB instances and MongoDB Atlas.
 * Avoids logging credentials or raw connection strings for security.
 *
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined.');
  }

  try {
    // Current Mongoose connection (no deprecated flags needed in Mongoose 6+)
    const conn = await mongoose.connect(uri, {
      dbName: 'staffsync',
      serverSelectionTimeoutMS: 5000 // Fast fail if server is not reachable
    });

    // Identify host/cluster safely without logging sensitive auth credentials
    const host = conn.connection.host || 'localhost';
    const dbName = conn.connection.name || 'staffsync';
    console.log(`[Database] MongoDB connected successfully to database '${dbName}' on host '${host}'.`);

    // Listen for runtime connection events
    mongoose.connection.on('error', (err) => {
      console.error('[Database] MongoDB runtime connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] MongoDB disconnected.');
    });

    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    console.error('[Database Error] Please check that MongoDB is running locally or verify your Atlas MONGODB_URI in server/.env.');
    // Rethrow error so caller can handle startup lifecycle
    throw error;
  }
};

module.exports = connectDB;
