const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('[PROFILE] access valid');
    return res.json({
      message: 'Success! You have accessed the protected API via MongoDB.',
      user_id: user.id,
      email: user.email
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
