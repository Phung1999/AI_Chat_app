const contactService = require('../services/contactService');

async function getContacts(req, res) {
  try {
    const contacts = contactService.getContacts(req.userId);
    res.json({ success: true, data: contacts });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get contacts' }
    });
  }
}

async function getPendingContacts(req, res) {
  try {
    const pending = contactService.getPendingContacts(req.userId);
    res.json({ success: true, data: pending });
  } catch (error) {
    console.error('Get pending contacts error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get pending contacts' }
    });
  }
}

async function addContact(req, res) {
  try {
    const { email } = req.body;
    console.log('[ADD_CONTACT] Attempting: userId=', req.userId, 'email=', email);
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Email is required' }
      });
    }
    
    const contact = contactService.addContactByEmail(req.userId, email);
    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    console.error('[ADD_CONTACT] Error:', error.message);
    if (error.message.includes('Cannot add yourself') || error.message.includes('already exists') || error.message.includes('already sent') || error.message.includes('not found')) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: error.message }
      });
    }
    console.error('Add contact error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to add contact' }
    });
  }
}

async function updateContact(req, res) {
  try {
    const { status } = req.body;
    console.log('[UPDATE_CONTACT] id:', req.params.id, 'userId:', req.userId, 'status:', status);
    const result = contactService.updateContactStatus(parseInt(req.params.id), req.userId, status);
    console.log('[UPDATE_CONTACT] result:', result);
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' }
      });
    }
    res.json({ success: true, data: { status } });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update contact' }
    });
  }
}

async function removeContact(req, res) {
  try {
    const result = contactService.removeContact(parseInt(req.params.id), req.userId);
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' }
      });
    }
    res.json({ success: true, data: { message: 'Contact removed' } });
  } catch (error) {
    console.error('Remove contact error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to remove contact' }
    });
  }
}

module.exports = { getContacts, getPendingContacts, addContact, updateContact, removeContact };