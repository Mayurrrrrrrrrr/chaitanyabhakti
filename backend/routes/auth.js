//
// FILE: backend/routes/auth.js
//
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Wrap everything in module.exports = (db) => { ... }
module.exports = (db) => {

  const JWT_SECRET = process.env.JWT_SECRET;

  // POST /api/auth/send-otp (From your original server.js)
  router.post('/send-otp', async (req, res) => {
    try {
      console.log('🔹 Received send-otp request:', req.body); // DEBUG
      const { mobile_number } = req.body;
      if (!mobile_number) return res.status(400).json({ error: 'Mobile number required' });

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      console.log(`🔹 Attempting to insert OTP for ${mobile_number}`); // DEBUG
      await db.query(
        'INSERT INTO otp_verifications (mobile_number, otp_code, expires_at) VALUES (?, ?, ?)',
        [mobile_number, otp, expiresAt]
      );

      console.log(`✅ OTP sent for ${mobile_number}: ${otp}`);
      // TODO: In production, integrate an SMS gateway here instead of sending OTP in response
      res.json({ success: true, message: 'OTP sent', otp: otp }); // Send OTP for testing
    } catch (error) {
      console.error('❌ Send OTP error details:', error); // DEBUG
      res.status(500).json({ error: 'Failed to send OTP', details: error.message }); // Send details to client for debugging
    }
  });

  // POST /api/auth/verify-otp (From your original server.js)
  router.post('/verify-otp', async (req, res) => {
    try {
      const { mobile_number, otp, name, spiritual_name } = req.body;

      const [otpRecords] = await db.query(
        'SELECT * FROM otp_verifications WHERE mobile_number = ? AND otp_code = ? AND expires_at > NOW() AND is_verified = FALSE ORDER BY created_at DESC LIMIT 1',
        [mobile_number, otp]
      );

      if (otpRecords.length === 0) return res.status(400).json({ error: 'Invalid or expired OTP' });
      await db.query('UPDATE otp_verifications SET is_verified = TRUE WHERE otp_id = ?', [otpRecords[0].otp_id]);

      let [users] = await db.query('SELECT * FROM users WHERE mobile_number = ?', [mobile_number]);
      let user;

      if (users.length === 0) {
        if (!name) return res.status(400).json({ error: 'Name required for registration' });

        const [result] = await db.query(
          'INSERT INTO users (mobile_number, name, spiritual_name) VALUES (?, ?, ?)',
          [mobile_number, name, spiritual_name || null]
        );
        user = { user_id: result.insertId, mobile_number, name, spiritual_name, is_super_admin: 0, profile_photo: null };
        // Ensure user_preferences are created for new user
        await db.query('INSERT INTO user_preferences (user_id) VALUES (?) ON DUPLICATE KEY UPDATE user_id = user_id', [user.user_id]);
      } else {
        user = users[0];
        await db.query('UPDATE users SET last_login = NOW() WHERE user_id = ?', [user.user_id]);
      }

      // Create the NEW standard JWT payload
      const payload = {
        user: {
          id: user.user_id,
          name: user.name,
          is_super_admin: user.is_super_admin
        }
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

      res.json({
        success: true,
        token,
        user: { // Send back the user object the frontend expects
          id: user.user_id,
          name: user.name,
          spiritual_name: user.spiritual_name,
          mobile_number: user.mobile_number,
          profile_photo: user.profile_photo,
          is_super_admin: user.is_super_admin
        }
      });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ error: 'Verification failed' });
    }
  });

  // POST /api/auth/login (NEW Password Login)
  router.post('/login', async (req, res) => {
    const { mobile_number, password } = req.body;

    if (!mobile_number || !password) {
      return res.status(400).json({ message: 'Mobile number and password are required.' });
    }

    try {
      const [users] = await db.query(
        'SELECT * FROM users WHERE mobile_number = ?',
        [mobile_number]
      );

      if (users.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      const user = users[0];

      if (!user.is_active) {
        return res.status(403).json({ message: 'This account has been deactivated.' });
      }

      if (!user.password) {
        return res.status(401).json({ message: 'Password not set for this account. Please contact admin.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      // Create the NEW standard JWT payload
      const payload = {
        user: {
          id: user.user_id,
          name: user.name,
          is_super_admin: user.is_super_admin
        }
      };

      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: '30d'
      });

      res.json({
        success: true,
        token,
        user: { // Send back the user object the frontend expects
          id: user.user_id,
          name: user.name,
          spiritual_name: user.spiritual_name,
          mobile_number: user.mobile_number,
          profile_photo: user.profile_photo,
          is_super_admin: user.is_super_admin
        }
      });

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

  // Return the router at the end of the function
  return router;
};