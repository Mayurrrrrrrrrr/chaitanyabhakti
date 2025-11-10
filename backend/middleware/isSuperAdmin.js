//
// FILE: backend/middleware/isSuperAdmin.js
//
const jwt = require('jsonwebtoken');

// Export a function that takes 'db' and returns the middleware
module.exports = (db) => {
  return async (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Standardize the user object from the token
      let userId;
      if (decoded.user && decoded.user.id) {
        userId = decoded.user.id;
      } else if (decoded.user_id) { // Handle old token format
        userId = decoded.user_id;
      } else {
        return res.status(401).json({ message: 'Invalid token payload' });
      }
      
      // Token is valid, now check for admin status in the DB
      const [rows] = await db.query(
        'SELECT is_super_admin FROM users WHERE user_id = ?', 
        [userId]
      );

      if (rows.length === 0 || !rows[0].is_super_admin) {
        return res.status(403).json({ message: 'Access denied. User is not a super admin.' });
      }

      // User is an admin, attach user info to the request and proceed
      // We use the ID from the DB check, which is the most secure
      req.user = { id: userId, is_super_admin: true }; 
      next();

    } catch (err) {
      res.status(401).json({ message: 'Token is not valid' });
    }
  };
};