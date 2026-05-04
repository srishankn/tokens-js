const { verifyToken } = require('../utils/jwt');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'INVALID_TOKEN' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return res.status(401).json({ error: 'INVALID_TOKEN' });
  }

  const token = parts[1];
  const result = verifyToken(token);

  if (!result.valid) {
    return res.status(401).json({ error: result.error });
  }

  if (result.decoded.type !== 'access') {
    return res.status(403).json({ error: 'INVALID_TOKEN' });
  }

  req.user = result.decoded;
  next();
};

module.exports = authMiddleware;
