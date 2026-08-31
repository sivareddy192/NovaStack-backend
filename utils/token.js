import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'novastack_jwt_ultra_secure_secret_key_2026_prod',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};
