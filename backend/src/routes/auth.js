const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  register,
  login,
  refresh,
  logout,
  me
} = require('../controllers/authController');

router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 50 }),
  body('password').isLength({ min: 8 })
], register);

router.post('/login', [
  body('username').trim().notEmpty(),
  body('password').notEmpty()
], login);

router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

module.exports = router;
