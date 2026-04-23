const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/constants');
const userService = require('./userService');

class AuthService {
  async register(email, password, displayName) {
    const existingUser = userService.getUserByEmail(email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = userService.createUser(email, passwordHash, displayName);
    const token = this.generateToken(user.id);

    return { user, token };
  }

  async login(email, password) {
    const user = userService.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    userService.updateUserStatus(user.id, 1);
    const token = this.generateToken(user.id);

    const { password_hash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  logout(userId) {
    userService.updateUserStatus(userId, 0);
  }

  generateToken(userId) {
    return jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  getProfile(userId) {
    const user = userService.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  updateProfile(userId, data) {
    userService.updateProfile(userId, data);
    return userService.getUserById(userId);
  }
}

module.exports = new AuthService();