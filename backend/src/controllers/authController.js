const authService = require('../services/authService');

async function register(req, res) {
  try {
    const { email, password, displayName } = req.body;
    const result = await authService.register(email, password, displayName);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    if (error.message === 'Email already exists') {
      return res.status(409).json({
        success: false,
        error: { code: 'EMAIL_EXISTS', message: error.message }
      });
    }
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Registration failed' }
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: error.message }
      });
    }
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Login failed' }
    });
  }
}

async function logout(req, res) {
  try {
    authService.logout(req.userId);
    res.json({ success: true, data: { message: 'Logged out successfully' } });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Logout failed' }
    });
  }
}

async function getProfile(req, res) {
  try {
    const user = authService.getProfile(req.userId);
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get profile' }
    });
  }
}

async function updateProfile(req, res) {
  try {
    const { displayName, avatarUrl } = req.body;
    const user = authService.updateProfile(req.userId, { displayName, avatarUrl });
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update profile' }
    });
  }
}

module.exports = { register, login, logout, getProfile, updateProfile };