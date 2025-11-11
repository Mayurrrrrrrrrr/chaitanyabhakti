//
// FILE: backend/middleware/isSuperAdmin.js
//
const jwt = require('jsonwebtoken');

// Export a function that takes 'db' and returns the middleware
module.exports = (db) => {
  return async (req, res, next) => {
    
    // 🛑 FIX: The `authenticateToken` middleware already ran and put the user
    // on `req.user`. We just need to check that user's ID against the database.
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication data not found.' });
    }

    try {
      // Check the DB to be 100% sure this user is an admin
      // This protects against old tokens if a user's admin status is revoked
      const [rows] = await db.query(
        'SELECT is_super_admin FROM users WHERE user_id = ?', 
        [req.user.id]
      );

      if (rows.length === 0 || !rows[0].is_super_admin) {
        return res.status(403).json({ message: 'Access denied. User is not a super admin.' });
      }

      // User is confirmed as an admin, proceed to the next route
      next();

    } catch (err) {
      console.error("isSuperAdmin middleware error:", err);
      res.status(500).json({ message: 'Server error during admin check.' });
    }
  };
};