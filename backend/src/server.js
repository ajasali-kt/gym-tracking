const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const muscleGroupRoutes = require('./routes/muscleGroups');
const exerciseRoutes = require('./routes/exercises');
const workoutPlanRoutes = require('./routes/workoutPlans');
const workoutDaysRoutes = require('./routes/workoutDays');
const dayExercisesRoutes = require('./routes/dayExercises');
const dashboardRoutes = require('./routes/dashboard');
const loggingRoutes = require('./routes/logging');
const progressRoutes = require('./routes/progress');
const adminRoutes = require('./routes/admin');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); // Enable CORS for frontend
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware (optional)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Gym Tracker API is running' });
});

// API Routes - Public (authentication)
app.use('/api/auth', authRoutes);

// API Routes - Public (shared data)
app.use('/api/muscle-groups', muscleGroupRoutes);
app.use('/api/exercises', exerciseRoutes);

// API Routes - Protected (user-specific data)
app.use('/api/plans', authenticate, workoutPlanRoutes);
app.use('/api/days', authenticate, workoutDaysRoutes);
app.use('/api/day-exercises', authenticate, dayExercisesRoutes);
app.use('/api/dashboard', authenticate, dashboardRoutes);
app.use('/api/logs', authenticate, loggingRoutes);
app.use('/api/progress', authenticate, progressRoutes);

// API Routes - Admin (keep unprotected for now)
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: `Route ${req.method} ${req.path} not found`,
    statusCode: 404
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💪 Gym Tracker API ready!`);
});
