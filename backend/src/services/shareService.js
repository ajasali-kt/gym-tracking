const prisma = require('../prismaClient');
const { randomUUID } = require('crypto');

/**
 * Create a shareable link for workout history
 * @param {number} userId - User ID
 * @param {Date} fromDate - Start date
 * @param {Date} toDate - End date
 * @param {number|null} expiresInDays - Days until expiration (null = never expires)
 * @returns {Promise<Object>} Share link details
 */
const createShare = async (userId, fromDate, toDate, expiresInDays = null) => {
  // Calculate expiration date
  let expiresAt = null;
  if (expiresInDays && expiresInDays > 0) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  }

  // Generate UUID token
  const token = randomUUID();

  // Create share record
  const share = await prisma.workoutShare.create({
    data: {
      token,
      userId,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      expiresAt,
      isActive: true
    }
  });

  return {
    id: share.id,
    token: share.token,
    fromDate: share.fromDate,
    toDate: share.toDate,
    expiresAt: share.expiresAt,
    isActive: share.isActive,
    createdAt: share.createdAt
  };
};

/**
 * Find latest share link for the same date range
 * @param {number} userId - User ID
 * @param {Date} fromDate - Start date
 * @param {Date} toDate - End date
 * @returns {Promise<Object|null>} Existing share link if found
 */
const findExistingShare = async (userId, fromDate, toDate) => {
  const normalizedFrom = new Date(fromDate);
  const normalizedTo = new Date(toDate);
  normalizedFrom.setUTCHours(0, 0, 0, 0);
  normalizedTo.setUTCHours(0, 0, 0, 0);

  const share = await prisma.workoutShare.findFirst({
    where: {
      userId,
      fromDate: normalizedFrom,
      toDate: normalizedTo
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  if (!share) return null;

  return {
    id: share.id,
    token: share.token,
    fromDate: share.fromDate,
    toDate: share.toDate,
    expiresAt: share.expiresAt,
    isActive: share.isActive,
    createdAt: share.createdAt
  };
};

/**
 * Renew/reactivate an existing share link
 * @param {string} token - Existing share token
 * @param {number|null} expiresInDays - Days until expiration (null = never)
 * @returns {Promise<Object>} Renewed share
 */
const renewShare = async (token, expiresInDays = null) => {
  let expiresAt = null;
  if (expiresInDays && expiresInDays > 0) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  }

  const share = await prisma.workoutShare.update({
    where: { token },
    data: {
      isActive: true,
      expiresAt,
      updatedAt: new Date()
    }
  });

  return {
    id: share.id,
    token: share.token,
    fromDate: share.fromDate,
    toDate: share.toDate,
    expiresAt: share.expiresAt,
    createdAt: share.createdAt
  };
};

/**
 * Get share by token and validate it
 * @param {string} token - Share token (UUID)
 * @returns {Promise<Object|null>} Share details if valid, null otherwise
 */
const getShareByToken = async (token) => {
  const share = await prisma.workoutShare.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          username: true
        }
      }
    }
  });

  if (!share) {
    return null;
  }

  // Check if active
  if (!share.isActive) {
    return { error: 'This share link has been revoked', statusCode: 403 };
  }

  // Check if expired
  if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
    return { error: 'This share link has expired', statusCode: 403 };
  }

  return share;
};

/**
 * Get all shares with optional filters (admin only)
 * @param {Object} filters - Filter options
 * @param {number|null} filters.userId - Filter by user ID
 * @param {boolean|null} filters.isActive - Filter by active status
 * @param {string|null} filters.search - Search by username or token
 * @returns {Promise<Array>} List of shares
 */
const getAllShares = async (filters = {}) => {
  const where = {};

  if (filters.userId) {
    where.userId = filters.userId;
  }

  if (filters.isActive !== undefined && filters.isActive !== null) {
    where.isActive = filters.isActive;
  }

  if (filters.search) {
    where.OR = [
      { token: { contains: filters.search } },
      { user: { username: { contains: filters.search, mode: 'insensitive' } } }
    ];
  }

  const shares = await prisma.workoutShare.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          username: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return shares;
};

/**
 * Revoke a share link (set is_active to false)
 * @param {string} token - Share token
 * @returns {Promise<Object>} Updated share
 */
const revokeShare = async (token) => {
  const share = await prisma.workoutShare.update({
    where: { token },
    data: { isActive: false, updatedAt: new Date() }
  });

  return share;
};

/**
 * Activate a share link (set is_active to true)
 * @param {string} token - Share token
 * @returns {Promise<Object>} Updated share
 */
const activateShare = async (token) => {
  const share = await prisma.workoutShare.update({
    where: { token },
    data: { isActive: true, updatedAt: new Date() }
  });

  return share;
};

/**
 * Delete a share permanently
 * @param {string} token - Share token
 * @returns {Promise<Object>} Deleted share
 */
const deleteShare = async (token) => {
  const share = await prisma.workoutShare.delete({
    where: { token }
  });

  return share;
};

/**
 * Count shares created today by a user (for rate limiting)
 * @param {number} userId - User ID
 * @returns {Promise<number>} Count of shares created today
 */
const countTodayShares = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const count = await prisma.workoutShare.count({
    where: {
      userId,
      createdAt: { gte: today }
    }
  });

  return count;
};

module.exports = {
  createShare,
  findExistingShare,
  renewShare,
  getShareByToken,
  getAllShares,
  revokeShare,
  activateShare,
  deleteShare,
  countTodayShares
};
