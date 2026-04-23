const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', chatController.getConversations);
router.post('/', chatController.getOrCreateConversation);
router.post('/group', chatController.createGroup);
router.get('/:id/members', chatController.getGroupMembers);
router.post('/:id/members', chatController.addMember);
router.delete('/:id/members/:userId', chatController.removeMember);
router.delete('/:id/leave', chatController.leaveGroup);
router.get('/:id/messages', chatController.getMessages);
router.post('/:id/messages', chatController.sendMessage);
router.post('/:id/read', chatController.markAsRead);

module.exports = router;