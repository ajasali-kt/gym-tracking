const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const muscleGroupRoutes = require('./routes/muscleGroups');
const exerciseRoutes = require('./routes/exercises');
const workoutPlanRoutes = require('./routes/workoutPlans');
const workoutDaysRoutes = require('./routes/workoutDays');
const dayExercisesRoutes = require('./routes/dayExercises');
const dashboardRoutes = require('./routes/dashboard');
const loggingRoutes = require('./routes/logging');
const progressRoutes = require('./routes/progress');
const adminRoutes = require('./routes/admin');

// Import error handler
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for frontend
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

// API Routes
app.use('/api/muscle-groups', muscleGroupRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/plans', workoutPlanRoutes);
app.use('/api/days', workoutDaysRoutes); // Day-specific routes
app.use('/api/day-exercises', dayExercisesRoutes); // Day exercise assignment routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/logs', loggingRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes); // Admin routes for importing data

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
