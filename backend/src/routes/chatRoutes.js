const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', chatController.getConversations);
router.post('/', chatController.getOrCreateConversation);
router.get('/:id/messages', chatController.getMessages);
router.post('/:id/read', chatController.markAsRead);

module.exports = router;