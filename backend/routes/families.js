//
// FILE: backend/routes/families.js
//
const express = require('express');
const router = express.Router();

//
// Converted to module.exports = (db) => { ... }
module.exports = (db) => {

  // Generate a random family code
  const generateFamilyCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // GET user's families
  router.get('/', async (req, res) => {
    try {
      const user_id = req.user.id; // Use req.user.id
      const [families] = await db.query(
        'SELECT f.*, fm.is_admin, fm.relation_label FROM families f JOIN family_members fm ON f.family_id = fm.family_id WHERE fm.user_id = ?',
        [user_id]
      );
      res.json(families);
    } catch (error) {
      console.error('Get families error:', error);
      res.status(500).json({ error: 'Failed to fetch families' });
    }
  });

  // GET family details
  router.get('/:family_id', async (req, res) => {
    try {
      const { family_id } = req.params;
      const [family] = await db.query('SELECT * FROM families WHERE family_id = ?', [family_id]);
      if (family.length === 0) return res.status(404).json({ error: 'Family not found' });

      const [members] = await db.query(
        'SELECT u.user_id, u.name, u.spiritual_name, u.profile_photo, fm.is_admin, fm.relation_label FROM users u JOIN family_members fm ON u.user_id = fm.user_id WHERE fm.family_id = ?',
        [family_id]
      );
      res.json({ ...family[0], members });
    } catch (error) {
      console.error('Get family details error:', error);
      res.status(500).json({ error: 'Failed to fetch family details' });
    }
  });

  // CREATE a new family
  router.post('/', async (req, res) => {
    try {
      const { family_name, description, relation_label } = req.body;
      const user_id = req.user.id; // Use req.user.id
      if (!family_name) return res.status(400).json({ error: 'Family name is required' });

      let family_code;
      let isCodeUnique = false;
      while (!isCodeUnique) {
        family_code = generateFamilyCode();
        const [existing] = await db.query('SELECT 1 FROM families WHERE family_code = ?', [family_code]);
        if (existing.length === 0) isCodeUnique = true;
      }

      const [result] = await db.query(
        'INSERT INTO families (family_name, family_code, description, created_by) VALUES (?, ?, ?, ?)',
        [family_name, family_code, description || null, user_id]
      );

      const family_id = result.insertId;
      await db.query(
        'INSERT INTO family_members (family_id, user_id, relation_label, is_admin) VALUES (?, ?, ?, ?)',
        [family_id, user_id, relation_label || 'Admin', 1]
      );

      res.status(201).json({ message: 'Family created', family_id, family_code });
    } catch (error) {
      console.error('Create family error:', error);
      res.status(500).json({ error: 'Failed to create family' });
    }
  });

  // JOIN a family
  router.post('/join', async (req, res) => {
    try {
      const { family_code, relation_label } = req.body;
      const user_id = req.user.id; // Use req.user.id
      if (!family_code) return res.status(400).json({ error: 'Family code is required' });

      const [family] = await db.query('SELECT family_id FROM families WHERE family_code = ?', [family_code]);
      if (family.length === 0) return res.status(404).json({ error: 'Invalid family code' });

      const family_id = family[0].family_id;
      await db.query(
        'INSERT INTO family_members (family_id, user_id, relation_label, is_admin) VALUES (?, ?, ?, 0) ON DUPLICATE KEY UPDATE relation_label = VALUES(relation_label)',
        [family_id, user_id, relation_label || null]
      );

      res.json({ message: 'Successfully joined family', family_id });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'You are already a member of this family' });
      }
      console.error('Join family error:', error);
      res.status(500).json({ error: 'Failed to join family' });
    }
  });

  // (Add other routes like LEAVE family, REMOVE member, UPDATE family info...)

  return router;
};