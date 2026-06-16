const express = require('express');
const eventController = require('../controllers/eventController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', eventController.getAllEvents);
router.get('/my-registrations', authenticate, eventController.getMyRegistrations);
router.get('/:id', eventController.getEventById);
router.post('/', authenticate, authorize('admin', 'staff'), upload.single('cover_image'), eventController.createEvent);
router.put('/:id', authenticate, authorize('admin', 'staff'), upload.single('cover_image'), eventController.updateEvent);
router.delete('/:id', authenticate, authorize('admin', 'staff'), eventController.deleteEvent);
router.post('/:id/register', authenticate, eventController.registerForEvent);

module.exports = router;
