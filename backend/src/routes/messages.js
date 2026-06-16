const express = require('express');
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/conversations', authenticate, messageController.getConversations);
router.post('/conversations', authenticate, messageController.getOrCreateConversation);
router.get('/conversations/:conversationId/messages', authenticate, messageController.getMessages);
router.post('/conversations/:conversationId/messages', authenticate, messageController.sendMessage);
router.get('/notifications', authenticate, messageController.getNotifications);
router.put('/notifications/:id/read', authenticate, messageController.markNotificationRead);

module.exports = router;
