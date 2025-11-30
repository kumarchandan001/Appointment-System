// server/app.js
/**
 * Express Application Setup
 * Main entry point for the Smart Appointment Booking System
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/db');
const limiter = require('./middleware/rateLimit');
const errorHandler = require('./middleware/error');
const startReminders = require('./jobs/reminders');

// Routes
const authRoutes = require('./routes/auth');
const providerRoutes = require('./routes/providers');
const appointmentRoutes = require('./routes/appointments');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Debug: Log all requests
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - Content-Type: ${req.get('Content-Type')}`);
  next();
});

// Connect DB
connectDB();

// Start cron job for reminders
startReminders();

// TEST: Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is working!' });
});

// API Routes MUST come before static files to take precedence
app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/appointments', appointmentRoutes);

// Serve static files from client folder AFTER API routes
app.use(express.static(path.join(__dirname, '../client')));

// Serve index.html for SPA (fallback for client-side routing)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Error middleware
app.use(errorHandler);

// Export for testing
module.exports = app;

// Start server
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Client serving from http://localhost:${PORT}`);
    console.log(`📚 API docs available at http://localhost:${PORT}/api/*\n`);
  });
}
