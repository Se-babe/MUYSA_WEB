const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, upload.single('profile_photo'), authController.updateProfile);
router.get('/verify/:token', authController.verifyEmail);

module.exports = router;
