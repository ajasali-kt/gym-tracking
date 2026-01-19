const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const prisma = require('../prismaClient');
const { hashPassword, comparePassword, validatePassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt');
const { authenticate } = require('../middleware/auth');

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 50 }),
  body('password').isLength({ min: 8 })
], async (req, res, next) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: true,
        message: 'Validation failed',
        errors: errors.array(),
        statusCode: 400
      });
    }

    const { username, password } = req.body;

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: true,
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors,
        statusCode: 400
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({
        error: true,
        message: 'User with this username already exists',
        statusCode: 400
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword
      },
      select: {
        id: true,
        username: true,
        userType: true,
        createdAt: true
      }
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.username);
    const refreshToken = generateRefreshToken(user.id, user.username);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user,
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', [
  body('username').trim().notEmpty(),
  body('password').notEmpty()
], async (req, res, next) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: true,
        message: 'Validation failed',
        errors: errors.array(),
        statusCode: 400
      });
    }

    const { username, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Invalid username or password',
        statusCode: 401
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: true,
        message: 'Invalid username or password',
        statusCode: 401
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.username);
    const refreshToken = generateRefreshToken(user.id, user.username);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        userType: user.userType,
        createdAt: user.createdAt
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: true,
        message: 'Refresh token is required',
        statusCode: 400
      });
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: true,
        message: 'Invalid token type',
        statusCode: 401
      });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'User not found',
        statusCode: 401
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user.id, user.username);

    res.json({
      success: true,
      tokens: {
        accessToken
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client should delete tokens)
 */
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        username: true,
        userType: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
