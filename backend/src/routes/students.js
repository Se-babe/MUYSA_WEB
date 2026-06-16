const express = require('express');
const studentController = require('../controllers/studentController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, studentController.getAllStudents);
router.get('/profile', authenticate, studentController.getProfile);
router.post('/profile', authenticate, studentController.createOrUpdateProfile);
router.put('/profile', authenticate, studentController.createOrUpdateProfile);
router.get('/:id', authenticate, studentController.getStudentById);

module.exports = router;
