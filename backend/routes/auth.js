const express = require('express');
const passport = require('../config/passport');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/auth');
require('dotenv').config();


// Redirect to Google for login
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const payload = { id: req.user._id, email: req.user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // You can send token as query param, or set it as cookie
    res.redirect(`${process.env.CLIENT_URL}/?token=${token}`);

  }
);

router.get('/status', authenticateToken, (req, res) => {
  res.status(200).json({ authenticated: true, user: req.user });
});

module.exports = router;
