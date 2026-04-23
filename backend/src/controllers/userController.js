const userService = require('../services/userService');

async function searchUsers(req, res) {
  try {
    const { q } = req.query;
    const users = userService.searchUsers(q, req.userId);
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Search failed' }
    });
  }
}

async function getUserById(req, res) {
  try {
    const user = userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' }
      });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get user' }
    });
  }
}

async function updateStatus(req, res) {
  try {
    const { status } = req.body;
    userService.updateUserStatus(req.userId, status ? 1 : 0);
    res.json({ success: true, data: { status: status ? 1 : 0 } });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update status' }
    });
  }
}

module.exports = { searchUsers, getUserById, updateStatus };