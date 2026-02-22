const { validationResult } = require('express-validator');
const {
  registerUser,
  loginUser,
  refreshAuthToken,
  logoutUser,
  getCurrentUser
} = require('../services/authService');

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: true,
      message: 'Validation failed',
      errors: errors.array(),
      statusCode: 400
    });
    return true;
  }
  return false;
};

const register = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error.details) {
      return res.status(error.statusCode || 400).json({
        error: true,
        message: error.message,
        errors: error.details,
        statusCode: error.statusCode || 400
      });
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;
    const result = await loginUser(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const result = await refreshAuthToken(req.body.refreshToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const result = await logoutUser();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const result = await getCurrentUser(req.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  me
};
