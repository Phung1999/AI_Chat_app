const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateSearch } = require('../middleware/validateMiddleware');

router.use(authMiddleware);

router.get('/search', validateSearch, userController.searchUsers);
router.get('/:id', userController.getUserById);
router.put('/status', userController.updateStatus);

module.exports = router;