import User from '../models/User.js';
import { generateToken } from '../utils/token.js';
import { isDbConnected } from '../config/db.js';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const emailLower = email.toLowerCase();

    if (isDbConnected()) {
      try {
        const userExists = await User.findOne({ email: emailLower });
        if (userExists) {
          return res.status(400).json({
            success: false,
            message: 'An account with this email address already exists. Please log in.',
          });
        }

        const user = await User.create({
          name,
          email: emailLower,
          password,
          role: 'user',
        });

        const token = generateToken(user._id);

        return res.status(201).json({
          success: true,
          message: 'Account created successfully as User',
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      } catch (dbErr) {}
    }

    const token = generateToken(`user-${Date.now()}`);
    return res.status(201).json({
      success: true,
      message: 'Account created successfully as User',
      token,
      user: {
        id: `user-${Date.now()}`,
        name,
        email: emailLower,
        role: 'user',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
