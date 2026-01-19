const { verifyToken } = require('../utils/jwt');
const prisma = require('../prismaClient');

/**
 * Authentication middleware
 * Extracts and verifies JWT token from Authorization header
 * Attaches user info to req.user and req.userId
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: true,
        message: 'No authentication token provided',
        statusCode: 401
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    // Check if token type is access token
    if (decoded.type !== 'access') {
      return res.status(401).json({
        error: true,
        message: 'Invalid token type',
        statusCode: 401
      });
    }

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        userType: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'User not found',
        statusCode: 401
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    return res.status(401).json({
      error: true,
      message: error.message || 'Authentication failed',
      statusCode: 401
    });
  }
};

/**
 * Admin authorization middleware
 * Checks if authenticated user is an admin (userType === 1)
 * Must be used after authenticate middleware
 */
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: true,
        message: 'Authentication required',
        statusCode: 401
      });
    }

    if (req.user.userType !== 1) {
      return res.status(403).json({
        error: true,
        message: 'Admin access required',
        statusCode: 403
      });
    }

    next();
  } catch (error) {
    console.error('Authorization error:', error);

    return res.status(403).json({
      error: true,
      message: 'Authorization failed',
      statusCode: 403
    });
  }
};

module.exports = {
  authenticate,
  isAdmin
};
