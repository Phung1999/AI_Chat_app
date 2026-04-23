const callService = require('../services/callService');

async function getCallHistory(req, res) {
  try {
    const { limit } = req.query;
    const history = callService.getCallHistory(req.userId, parseInt(limit) || 20);
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Get call history error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get call history' }
    });
  }
}

async function createCall(req, res) {
  try {
    const { receiverId, callType } = req.body;
    const callLog = callService.createCallLog(req.userId, receiverId, callType || 'video');
    res.json({ success: true, data: callLog });
  } catch (error) {
    console.error('Create call error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to create call' }
    });
  }
}

async function updateCallStatus(req, res) {
  try {
    const { status } = req.body;
    callService.updateCallStatus(parseInt(req.params.id), status);
    res.json({ success: true, data: { status } });
  } catch (error) {
    console.error('Update call status error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update call status' }
    });
  }
}

module.exports = { getCallHistory, createCall, updateCallStatus };