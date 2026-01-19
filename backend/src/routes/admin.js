const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Admin Routes
 * Protected by authentication and admin role check
 */

// ============================================
// Import Muscle Groups from JSON
// ============================================
router.post('/import/muscle-groups', authenticate, isAdmin, async (req, res) => {
  try {
    const { muscleGroups } = req.body;

    if (!Array.isArray(muscleGroups)) {
      return res.status(400).json({
        error: true,
        message: 'muscleGroups must be an array'
      });
    }

    const results = [];
    const errors = [];

    for (const group of muscleGroups) {
      try {
        // Check if muscle group already exists
        const existing = await prisma.muscleGroup.findUnique({
          where: { name: group.name }
        });

        if (existing) {
          // Update existing
          const updated = await prisma.muscleGroup.update({
            where: { id: existing.id },
            data: {
              description: group.description || existing.description
            }
          });
          results.push({ action: 'updated', muscleGroup: updated });
        } else {
          // Create new
          const created = await prisma.muscleGroup.create({
            data: {
              name: group.name,
              description: group.description || null
            }
          });
          results.push({ action: 'created', muscleGroup: created });
        }
      } catch (error) {
        errors.push({
          muscleGroup: group.name,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Imported ${results.length} muscle groups`,
      results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error importing muscle groups:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to import muscle groups',
      details: error.message
    });
  }
});

// ============================================
// Import Exercises from JSON
// ============================================
router.post('/import/exercises', authenticate, isAdmin, async (req, res) => {
  try {
    const { exercises } = req.body;

    if (!Array.isArray(exercises)) {
      return res.status(400).json({
        error: true,
        message: 'exercises must be an array'
      });
    }

    const results = [];
    const errors = [];

    for (const exercise of exercises) {
      try {
        // Find muscle group by name
        const muscleGroup = await prisma.muscleGroup.findUnique({
          where: { name: exercise.muscleGroupName }
        });

        if (!muscleGroup) {
          errors.push({
            exercise: exercise.name,
            error: `Muscle group "${exercise.muscleGroupName}" not found. Please import muscle groups first.`
          });
          continue;
        }

        // Check if exercise already exists
        const existing = await prisma.exercise.findUnique({
          where: { name: exercise.name }
        });

        if (existing) {
          // Update existing
          const updated = await prisma.exercise.update({
            where: { id: existing.id },
            data: {
              muscleGroupId: muscleGroup.id,
              description: exercise.description || existing.description,
              steps: exercise.steps || existing.steps,
              youtubeUrl: exercise.youtubeUrl || existing.youtubeUrl
            }
          });
          results.push({ action: 'updated', exercise: updated });
        } else {
          // Create new
          const created = await prisma.exercise.create({
            data: {
              name: exercise.name,
              muscleGroupId: muscleGroup.id,
              description: exercise.description || 'No description provided',
              steps: exercise.steps || [],
              youtubeUrl: exercise.youtubeUrl || null
            }
          });
          results.push({ action: 'created', exercise: created });
        }
      } catch (error) {
        errors.push({
          exercise: exercise.name,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Imported ${results.length} exercises`,
      results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error importing exercises:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to import exercises',
      details: error.message
    });
  }
});

// ============================================
// Get Database Stats
// ============================================
router.get('/stats', authenticate, isAdmin, async (req, res) => {
  try {
    const stats = {
      muscleGroups: await prisma.muscleGroup.count(),
      exercises: await prisma.exercise.count(),
      workoutPlans: await prisma.workoutPlan.count(),
      workoutDays: await prisma.workoutDay.count(),
      workoutLogs: await prisma.workoutLog.count(),
      exerciseLogs: await prisma.exerciseLog.count()
    };

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to fetch stats',
      details: error.message
    });
  }
});

// ============================================
// Clear All Data (Use with caution!)
// ============================================
router.delete('/clear/all', authenticate, isAdmin, async (req, res) => {
  try {
    // Delete in correct order to respect foreign key constraints
    await prisma.exerciseLog.deleteMany({});
    await prisma.workoutLog.deleteMany({});
    await prisma.workoutDayExercise.deleteMany({});
    await prisma.workoutDay.deleteMany({});
    await prisma.workoutPlan.deleteMany({});
    await prisma.exercise.deleteMany({});
    await prisma.muscleGroup.deleteMany({});

    res.json({
      success: true,
      message: 'All data cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing data:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to clear data',
      details: error.message
    });
  }
});

module.exports = router;
