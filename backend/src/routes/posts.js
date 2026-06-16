const express = require('express');
const postController = require('../controllers/postController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', postController.getAllPosts);
router.get('/:slug', postController.getPostBySlug);
router.post('/', authenticate, authorize('admin', 'staff'), upload.single('cover_image'), postController.createPost);
router.put('/:id', authenticate, authorize('admin', 'staff'), upload.single('cover_image'), postController.updatePost);
router.delete('/:id', authenticate, authorize('admin', 'staff'), postController.deletePost);

module.exports = router;
