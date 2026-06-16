const express = require('express');
const jobController = require('../controllers/jobController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', jobController.getAllJobs);
router.get('/my-applications', authenticate, jobController.getMyApplications);
router.get('/:id', jobController.getJobById);
router.post('/', authenticate, authorize('alumni', 'admin'), jobController.createJob);
router.put('/:id', authenticate, authorize('alumni', 'admin'), jobController.updateJob);
router.delete('/:id', authenticate, authorize('alumni', 'admin'), jobController.deleteJob);
router.post('/:id/apply', authenticate, upload.single('cv'), jobController.applyForJob);

module.exports = router;
