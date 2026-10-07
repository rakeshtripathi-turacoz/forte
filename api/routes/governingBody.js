const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/governing-body - Get all governing body members
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM governing_body WHERE is_active = TRUE ORDER BY display_order'
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching governing body:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching governing body members',
      error: error.message
    });
  }
});

// POST /api/governing-body - Add new member
router.post('/', async (req, res) => {
  try {
    const { name, designation, role_in_gb, display_order } = req.body;

    const [result] = await db.query(
      'INSERT INTO governing_body (name, designation, role_in_gb, display_order) VALUES (?, ?, ?, ?)',
      [name, designation, role_in_gb, display_order || 0]
    );

    res.json({
      success: true,
      message: 'Governing body member added successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding governing body member'
    });
  }
});

// PUT /api/governing-body/:id - Update member
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, designation, role_in_gb, display_order, is_active } = req.body;

    await db.query(
      'UPDATE governing_body SET name = ?, designation = ?, role_in_gb = ?, display_order = ?, is_active = ?, updated_at = NOW() WHERE id = ?',
      [name, designation, role_in_gb, display_order, is_active !== undefined ? is_active : true, id]
    );

    res.json({
      success: true,
      message: 'Governing body member updated successfully'
    });
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating governing body member'
    });
  }
});

// DELETE /api/governing-body/:id - Delete member
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM governing_body WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Governing body member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting governing body member'
    });
  }
});

module.exports = router;
