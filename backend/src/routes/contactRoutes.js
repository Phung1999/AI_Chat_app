const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', contactController.getContacts);
router.post('/', contactController.addContact);
router.put('/:id', contactController.updateContact);
router.delete('/:id', contactController.removeContact);

module.exports = router;