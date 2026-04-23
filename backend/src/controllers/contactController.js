const contactService = require('../services/contactService');

async function getContacts(req, res) {
  try {
    const contacts = contactService.getContacts(req.userId);
    const pending = contactService.getPendingContacts(req.userId);
    res.json({ success: true, data: { contacts, pending } });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get contacts' }
    });
  }
}

async function addContact(req, res) {
  try {
    const { contactId } = req.body;
    const contact = contactService.addContact(req.userId, contactId);
    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    if (error.message.includes('Cannot add yourself') || error.message.includes('already exists')) {
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
    const result = contactService.updateContactStatus(req.params.id, req.userId, status);
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

module.exports = { getContacts, addContact, updateContact, removeContact };