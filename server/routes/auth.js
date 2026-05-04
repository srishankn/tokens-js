const express = require('express');
const User = require('../models/User');
const Session = require('../models/Session');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    const newUser = await User.create({ email, password });
    return res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token to MongoDB Session store
    await Session.create({
      userId: user._id,
      refreshToken: refreshToken
    });

    console.log('[LOGIN] tokens issued');

    // Set httpOnly cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // Set to true in prod with HTTPS
      sameSite: 'lax',
      maxAge: 5 * 60 * 1000 // 5 minutes
    });

    return res.json({ access_token: accessToken });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'INVALID_TOKEN' });
    }

    const result = verifyToken(refreshToken);

    if (!result.valid || result.decoded.type !== 'refresh') {
      console.log('[REFRESH] invalid or expired refresh token');
      await Session.deleteOne({ refreshToken });
      res.clearCookie('refreshToken');
      return res.status(401).json({ error: 'INVALID_TOKEN' });
    }

    const userId = result.decoded.user_id;
    
    // Verify the exact token matches the one in DB to prevent reuse of revoked tokens
    const storedSession = await Session.findOne({ userId, refreshToken });

    if (!storedSession) {
      console.log('[REFRESH] token mismatch / revoked');
      await Session.deleteMany({ userId }); // Optional: Delete all sessions for user if suspicious reuse detected
      res.clearCookie('refreshToken');
      return res.status(401).json({ error: 'INVALID_TOKEN' });
    }

    const newAccessToken = generateAccessToken(userId);
    console.log('[REFRESH] new access token issued');

    return res.json({ access_token: newAccessToken });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      await Session.deleteOne({ refreshToken });
      res.clearCookie('refreshToken');
      console.log('[LOGOUT] refresh invalidated');
    }

    return res.json({ message: 'Successfully logged out' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
