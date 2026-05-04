const jwt = require('jsonwebtoken');

const SECRET_KEY = "super-secret-key-for-demo";

const generateAccessToken = (userId) => {
  return jwt.sign(
    { user_id: userId, type: 'access' },
    SECRET_KEY,
    { expiresIn: '20s' }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { user_id: userId, type: 'refresh' },
    SECRET_KEY,
    { expiresIn: '5m' }
  );
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return { valid: true, decoded };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { valid: false, error: 'TOKEN_EXPIRED' };
    }
    return { valid: false, error: 'INVALID_TOKEN' };
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken
};
