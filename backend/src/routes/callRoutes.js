const express = require('express');
const router = express.Router();
const callController = require('../controllers/callController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/history', callController.getCallHistory);
router.post('/', callController.createCall);
router.put('/:id', callController.updateCallStatus);

module.exports = router;