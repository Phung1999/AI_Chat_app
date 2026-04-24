function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  const errors = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  if (password.length > 100) {
    errors.push('Password must be less than 100 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 1000);
}

function validateRegister(req, res, next) {
  const { email, password, displayName } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' }
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid email format' }
    });
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: passwordValidation.errors[0] }
    });
  }

  if (displayName) {
    req.body.displayName = sanitizeInput(displayName);
  }
  req.body.email = email.toLowerCase().trim();

  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' }
    });
  }

  next();
}

function validateSearch(req, res, next) {
  let { q } = req.query;
  
  if (!q || (typeof q === 'string' && q.trim().length < 1)) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Search query is required' }
    });
  }

  if (typeof q === 'string') {
    req.query.q = sanitizeInput(q);
  }
  
  next();
}

function validateMessage(req, res, next) {
  const { content, conversationId } = req.body;
  
  if (!conversationId || !content) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Content and conversationId are required' }
    });
  }

  if (typeof content !== 'string' || content.length > 5000) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid message content' }
    });
  }

  req.body.content = content.trim().substring(0, 5000);
  next();
}

module.exports = { 
  validateRegister, 
  validateLogin, 
  validateSearch,
  validateMessage,
  validatePassword,
  sanitizeInput 
};