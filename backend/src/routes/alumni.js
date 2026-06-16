const express = require('express');
const alumniController = require('../controllers/alumniController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, alumniController.getAllAlumni);
router.get('/profile', authenticate, alumniController.getProfile);
router.post('/profile', authenticate, alumniController.createOrUpdateProfile);
router.put('/profile', authenticate, alumniController.createOrUpdateProfile);
router.get('/:id', authenticate, alumniController.getAlumniById);

module.exports = router;
