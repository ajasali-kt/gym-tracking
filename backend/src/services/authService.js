const prisma = require('../prismaClient');
const { hashPassword, comparePassword, validatePassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt');
const { createHttpError } = require('../utils/http');

const registerUser = async (payload) => {
  const { username, password } = payload;
  const passwordValidation = validatePassword(password);

  if (!passwordValidation.isValid) {
    const error = createHttpError(400, 'Password does not meet requirements');
    error.details = passwordValidation.errors;
    throw error;
  }

  const existingUser = await prisma.user.findUnique({
    where: { username }
  });

  if (existingUser) {
    throw createHttpError(400, 'User with this username already exists');
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      userFeature: {
        create: {
          bodyMeasurementsEnabled: false
        }
      }
    },
    select: getUserSelect()
  });

  return {
    success: true,
    message: 'User registered successfully',
    user,
    tokens: {
      accessToken: generateAccessToken(user.id, user.username),
      refreshToken: generateRefreshToken(user.id, user.username)
    }
  };
};

const loginUser = async (payload) => {
  const { username, password } = payload;
  const user = await prisma.user.findUnique({
    where: { username }
  });

  if (!user) {
    throw createHttpError(401, 'Invalid username or password');
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw createHttpError(401, 'Invalid username or password');
  }

  return {
    success: true,
    message: 'Login successful',
    user: await formatAuthUser(user.id),
    tokens: {
      accessToken: generateAccessToken(user.id, user.username),
      refreshToken: generateRefreshToken(user.id, user.username)
    }
  };
};

const refreshAuthToken = async (refreshToken) => {
  if (!refreshToken) {
    throw createHttpError(400, 'Refresh token is required');
  }

  const decoded = verifyToken(refreshToken);
  if (decoded.type !== 'refresh') {
    throw createHttpError(401, 'Invalid token type');
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  });

  if (!user) {
    throw createHttpError(401, 'User not found');
  }

  return {
    success: true,
    tokens: {
      accessToken: generateAccessToken(user.id, user.username)
    }
  };
};

const logoutUser = async () => ({
  success: true,
  message: 'Logout successful'
});

const getUserSelect = () => ({
  id: true,
  username: true,
  userType: true,
  createdAt: true,
  userFeature: {
    select: {
      bodyMeasurementsEnabled: true
    }
  }
});

const ensureUserFeature = async (userId) => {
  return prisma.userFeature.upsert({
    where: { userId },
    update: {},
    create: { userId },
    select: {
      bodyMeasurementsEnabled: true
    }
  });
};

const formatAuthUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: getUserSelect()
  });

  const userFeature = user.userFeature || await ensureUserFeature(user.id);

  return {
    id: user.id,
    username: user.username,
    userType: user.userType,
    createdAt: user.createdAt,
    features: {
      bodyMeasurementsEnabled: !!userFeature.bodyMeasurementsEnabled
    }
  };
};

const getCurrentUser = async (userId) => {
  const user = await formatAuthUser(userId);

  return {
    success: true,
    user
  };
};

module.exports = {
  registerUser,
  loginUser,
  refreshAuthToken,
  logoutUser,
  getCurrentUser
};
