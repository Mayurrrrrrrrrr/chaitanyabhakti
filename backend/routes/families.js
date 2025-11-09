// =====================================================
// FAMILY MANAGEMENT ROUTES
// File: routes/families.js
// =====================================================

const express = require('express');
const router = express.Router();

// =====================================================
// CREATE FAMILY
// =====================================================

// Create new family (Super admin or any user)
router.post('/create', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { family_name, description } = req.body;

        if (!family_name) {
            return res.status(400).json({ error: 'Family name required' });
        }

        // Generate unique family code
        const family_code = generateFamilyCode();

        // Insert family
        const [result] = await req.db.query(
            'INSERT INTO families (family_name, family_code, description, created_by) VALUES (?, ?, ?, ?)',
            [family_name, family_code, description || null, user_id]
        );

        // Add creator as admin member
        await req.db.query(
            'INSERT INTO family_members (family_id, user_id, relation_label, relation_label_en, is_admin) VALUES (?, ?, ?, ?, TRUE)',
            [result.insertId, user_id, 'प्रभु जी', 'Prabhu Ji']
        );

        res.json({
            success: true,
            message: 'Family created successfully',
            family: {
                family_id: result.insertId,
                family_name,
                family_code,
                role: 'admin'
            }
        });

    } catch (error) {
        console.error('Create family error:', error);
        res.status(500).json({ error: 'Failed to create family' });
    }
});

// =====================================================
// GET FAMILIES
// =====================================================

// Get user's families
router.get('/my-families', async (req, res) => {
    try {
        const { user_id } = req.user;
        const lang = req.query.lang || 'hi';

        const [families] = await req.db.query(`
            SELECT 
                f.family_id,
                f.family_name,
                f.family_code,
                f.description,
                f.profile_photo,
                fm.relation_label${lang === 'en' ? '_en' : ''} as my_relation,
                fm.is_admin,
                fm.joined_at,
                COUNT(DISTINCT fm2.user_id) as member_count,
                u.name as created_by_name
            FROM family_members fm
            JOIN families f ON fm.family_id = f.family_id
            LEFT JOIN family_members fm2 ON f.family_id = fm2.family_id
            LEFT JOIN users u ON f.created_by = u.user_id
            WHERE fm.user_id = ?
            GROUP BY f.family_id
            ORDER BY fm.joined_at DESC
        `, [user_id]);

        res.json({
            success: true,
            families,
            total: families.length
        });

    } catch (error) {
        console.error('Get families error:', error);
        res.status(500).json({ error: 'Failed to fetch families' });
    }
});

// Get family details
router.get('/:family_id', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { family_id } = req.params;
        const lang = req.query.lang || 'hi';

        // Check if user is member
        const [membership] = await req.db.query(
            'SELECT * FROM family_members WHERE family_id = ? AND user_id = ?',
            [family_id, user_id]
        );

        if (membership.length === 0) {
            return res.status(403).json({ error: 'Not a member of this family' });
        }

        // Get family details
        const [families] = await req.db.query(`
            SELECT 
                f.*,
                u.name as created_by_name,
                COUNT(DISTINCT fm.user_id) as member_count
            FROM families f
            LEFT JOIN users u ON f.created_by = u.user_id
            LEFT JOIN family_members fm ON f.family_id = fm.family_id
            WHERE f.family_id = ?
            GROUP BY f.family_id
        `, [family_id]);

        if (families.length === 0) {
            return res.status(404).json({ error: 'Family not found' });
        }

        // Get members
        const [members] = await req.db.query(`
            SELECT 
                u.user_id,
                u.name,
                u.spiritual_name,
                u.profile_photo,
                u.total_japa_count,
                u.current_streak,
                fm.relation_label${lang === 'en' ? '_en' : ''} as relation,
                fm.is_admin,
                fm.joined_at
            FROM family_members fm
            JOIN users u ON fm.user_id = u.user_id
            WHERE fm.family_id = ?
            ORDER BY fm.is_admin DESC, fm.joined_at ASC
        `, [family_id]);

        res.json({
            success: true,
            family: families[0],
            members,
            my_role: membership[0].is_admin ? 'admin' : 'member'
        });

    } catch (error) {
        console.error('Get family details error:', error);
        res.status(500).json({ error: 'Failed to fetch family details' });
    }
});

// =====================================================
// JOIN FAMILY
// =====================================================

// Join family via code
router.post('/join', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { family_code, relation_label, relation_label_en } = req.body;

        if (!family_code) {
            return res.status(400).json({ error: 'Family code required' });
        }

        // Find family
        const [families] = await req.db.query(
            'SELECT * FROM families WHERE family_code = ?',
            [family_code]
        );

        if (families.length === 0) {
            return res.status(404).json({ error: 'Invalid family code' });
        }

        const family = families[0];

        // Check if already member
        const [existing] = await req.db.query(
            'SELECT * FROM family_members WHERE family_id = ? AND user_id = ?',
            [family.family_id, user_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Already a member of this family' });
        }

        // Add as member
        await req.db.query(
            'INSERT INTO family_members (family_id, user_id, relation_label, relation_label_en, is_admin) VALUES (?, ?, ?, ?, FALSE)',
            [family.family_id, user_id, relation_label || 'सदस्य', relation_label_en || 'Member']
        );

        res.json({
            success: true,
            message: 'Joined family successfully',
            family: {
                family_id: family.family_id,
                family_name: family.family_name
            }
        });

    } catch (error) {
        console.error('Join family error:', error);
        res.status(500).json({ error: 'Failed to join family' });
    }
});

// =====================================================
// MANAGE MEMBERS
// =====================================================

// Add member to family (Admin only)
router.post('/:family_id/add-member', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { family_id } = req.params;
        const { member_mobile, relation_label, relation_label_en } = req.body;

        // Check if requester is admin
        const [membership] = await req.db.query(
            'SELECT * FROM family_members WHERE family_id = ? AND user_id = ? AND is_admin = TRUE',
            [family_id, user_id]
        );

        if (membership.length === 0) {
            return res.status(403).json({ error: 'Only admins can add members' });
        }

        // Find user by mobile
        const [users] = await req.db.query(
            'SELECT * FROM users WHERE mobile_number = ?',
            [member_mobile]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found with this mobile number' });
        }

        const member_id = users[0].user_id;

        // Check if already member
        const [existing] = await req.db.query(
            'SELECT * FROM family_members WHERE family_id = ? AND user_id = ?',
            [family_id, member_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'User is already a member' });
        }

        // Add member
        await req.db.query(
            'INSERT INTO family_members (family_id, user_id, relation_label, relation_label_en, is_admin) VALUES (?, ?, ?, ?, FALSE)',
            [family_id, member_id, relation_label || 'सदस्य', relation_label_en || 'Member']
        );

        res.json({
            success: true,
            message: 'Member added successfully',
            member: {
                user_id: member_id,
                name: users[0].name,
                relation: relation_label
            }
        });

    } catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({ error: 'Failed to add member' });
    }
});

// Update member relation (Admin only)
router.put('/:family_id/members/:member_id', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { family_id, member_id } = req.params;
        const { relation_label, relation_label_en, is_admin } = req.body;

        // Check if requester is admin
        const [requesterMembership] = await req.db.query(
            'SELECT * FROM family_members WHERE family_id = ? AND user_id = ? AND is_admin = TRUE',
            [family_id, user_id]
        );

        if (requesterMembership.length === 0) {
            return res.status(403).json({ error: 'Only admins can update members' });
        }

        // Update member
        const updates = [];
        const values = [];

        if (relation_label) {
            updates.push('relation_label = ?');
            values.push(relation_label);
        }
        if (relation_label_en) {
            updates.push('relation_label_en = ?');
            values.push(relation_label_en);
        }
        if (is_admin !== undefined) {
            updates.push('is_admin = ?');
            values.push(is_admin);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(family_id, member_id);

        await req.db.query(
            `UPDATE family_members SET ${updates.join(', ')} WHERE family_id = ? AND user_id = ?`,
            values
        );

        res.json({
            success: true,
            message: 'Member updated successfully'
        });

    } catch (error) {
        console.error('Update member error:', error);
        res.status(500).json({ error: 'Failed to update member' });
    }
});

// Remove member from family (Admin only)
router.delete('/:family_id/members/:member_id', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { family_id, member_id } = req.params;

        // Check if requester is admin
        const [requesterMembership] = await req.db.query(
            'SELECT * FROM family_members WHERE family_id = ? AND user_id = ? AND is_admin = TRUE',
            [family_id, user_id]
        );

        if (requesterMembership.length === 0) {
            return res.status(403).json({ error: 'Only admins can remove members' });
        }

        // Can't remove self if you're the creator
        const [family] = await req.db.query(
            'SELECT * FROM families WHERE family_id = ? AND created_by = ?',
            [family_id, member_id]
        );

        if (family.length > 0) {
            return res.status(400).json({ error: 'Cannot remove family creator' });
        }

        // Remove member
        await req.db.query(
            'DELETE FROM family_members WHERE family_id = ? AND user_id = ?',
            [family_id, member_id]
        );

        res.json({
            success: true,
            message: 'Member removed successfully'
        });

    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({ error: 'Failed to remove member' });
    }
});

// Leave family (self)
router.post('/:family_id/leave', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { family_id } = req.params;

        // Check if creator
        const [family] = await req.db.query(
            'SELECT * FROM families WHERE family_id = ? AND created_by = ?',
            [family_id, user_id]
        );

        if (family.length > 0) {
            return res.status(400).json({ error: 'Family creator cannot leave. Delete family instead.' });
        }

        // Remove membership
        await req.db.query(
            'DELETE FROM family_members WHERE family_id = ? AND user_id = ?',
            [family_id, user_id]
        );

        res.json({
            success: true,
            message: 'Left family successfully'
        });

    } catch (error) {
        console.error('Leave family error:', error);
        res.status(500).json({ error: 'Failed to leave family' });
    }
});

// =====================================================
// DELETE FAMILY
// =====================================================

// Delete family (Creator only)
router.delete('/:family_id', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { family_id } = req.params;

        // Check if creator
        const [family] = await req.db.query(
            'SELECT * FROM families WHERE family_id = ? AND created_by = ?',
            [family_id, user_id]
        );

        if (family.length === 0) {
            return res.status(403).json({ error: 'Only family creator can delete' });
        }

        // Delete family (CASCADE will handle related records)
        await req.db.query('DELETE FROM families WHERE family_id = ?', [family_id]);

        res.json({
            success: true,
            message: 'Family deleted successfully'
        });

    } catch (error) {
        console.error('Delete family error:', error);
        res.status(500).json({ error: 'Failed to delete family' });
    }
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

// Generate unique 6-character family code
function generateFamilyCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Remove ambiguous chars
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;
