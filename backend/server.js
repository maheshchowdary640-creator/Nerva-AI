require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
// const interviewRoutes = require('./routes/interviewRoutes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for development ease; configure specifically for production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root route to verify server status
app.get('/', (req, res) => {
  res.send('AI Interview Coach API is running successfully.');
});

// Register API Routes
// app.use('/api', interviewRoutes);
const nervaRoutes = require('./routes/nervaRoutes');
app.use('/api/nerva', nervaRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong on the server.'
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
