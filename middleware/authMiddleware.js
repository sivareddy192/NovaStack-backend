import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this resource. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'novastack_jwt_ultra_secure_secret_key_2026_prod'
    );

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists or unauthorized. Please log in again.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed or expired. Please log in again.',
    });
  }
};

export const authorize = (...roles) => {
  const normalizedRoles = roles.map((r) => r.toLowerCase());
  return (req, res, next) => {
    const userRole = (req.user?.role || '').toLowerCase();
    if (!req.user || !normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user?.role}' is not authorized to perform this administrative action.`,
      });
    }
    next();
  };
};
