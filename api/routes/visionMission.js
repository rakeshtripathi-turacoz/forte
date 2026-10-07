const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/vision-mission/complete - Get all vision, mission and core values
router.get('/complete', async (req, res) => {
  try {
    const [vision] = await db.query(
      'SELECT * FROM vision_mission WHERE section_type = ? AND is_active = TRUE ORDER BY display_order',
      ['vision']
    );

    const [mission] = await db.query(
      'SELECT * FROM vision_mission WHERE section_type = ? AND is_active = TRUE ORDER BY display_order',
      ['mission']
    );

    const [coreValues] = await db.query(
      'SELECT * FROM core_values WHERE is_active = TRUE ORDER BY display_order'
    );

    res.json({
      success: true,
      data: {
        vision: vision[0] || null,
        mission: mission[0] || null,
        coreValues: coreValues || []
      }
    });
  } catch (error) {
    console.error('Error fetching vision & mission data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vision & mission data',
      error: error.message
    });
  }
});

// GET /api/vision-mission/vision - Get vision
router.get('/vision', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM vision_mission WHERE section_type = ? AND is_active = TRUE LIMIT 1',
      ['vision']
    );
    res.json({
      success: true,
      data: rows[0] || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vision'
    });
  }
});

// PUT /api/vision-mission/vision - Update vision
router.put('/vision', async (req, res) => {
  try {
    const { title, content, image_url } = req.body;

    // Check if vision exists
    const [existing] = await db.query(
      'SELECT id FROM vision_mission WHERE section_type = ?',
      ['vision']
    );

    if (existing.length > 0) {
      // Update existing
      await db.query(
        'UPDATE vision_mission SET title = ?, content = ?, image_url = ?, updated_at = NOW() WHERE section_type = ?',
        [title, content, image_url, 'vision']
      );
    } else {
      // Insert new
      await db.query(
        'INSERT INTO vision_mission (section_type, title, content, image_url, display_order) VALUES (?, ?, ?, ?, ?)',
        ['vision', title, content, image_url, 1]
      );
    }

    res.json({
      success: true,
      message: 'Vision updated successfully'
    });
  } catch (error) {
    console.error('Error updating vision:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating vision'
    });
  }
});

// GET /api/vision-mission/mission - Get mission
router.get('/mission', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM vision_mission WHERE section_type = ? AND is_active = TRUE LIMIT 1',
      ['mission']
    );
    res.json({
      success: true,
      data: rows[0] || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching mission'
    });
  }
});

// PUT /api/vision-mission/mission - Update mission
router.put('/mission', async (req, res) => {
  try {
    const { title, content, image_url } = req.body;

    // Check if mission exists
    const [existing] = await db.query(
      'SELECT id FROM vision_mission WHERE section_type = ?',
      ['mission']
    );

    if (existing.length > 0) {
      // Update existing
      await db.query(
        'UPDATE vision_mission SET title = ?, content = ?, image_url = ?, updated_at = NOW() WHERE section_type = ?',
        [title, content, image_url, 'mission']
      );
    } else {
      // Insert new
      await db.query(
        'INSERT INTO vision_mission (section_type, title, content, image_url, display_order) VALUES (?, ?, ?, ?, ?)',
        ['mission', title, content, image_url, 2]
      );
    }

    res.json({
      success: true,
      message: 'Mission updated successfully'
    });
  } catch (error) {
    console.error('Error updating mission:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating mission'
    });
  }
});

// GET /api/vision-mission/core-values - Get all core values
router.get('/core-values', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM core_values WHERE is_active = TRUE ORDER BY display_order'
    );
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching core values'
    });
  }
});

// POST /api/vision-mission/core-values - Add new core value
router.post('/core-values', async (req, res) => {
  try {
    const { title, description, icon_class, display_order } = req.body;

    const [result] = await db.query(
      'INSERT INTO core_values (title, description, icon_class, display_order) VALUES (?, ?, ?, ?)',
      [title, description, icon_class || 'fas fa-star', display_order || 0]
    );

    res.json({
      success: true,
      message: 'Core value added successfully',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding core value'
    });
  }
});

// PUT /api/vision-mission/core-values/:id - Update core value
router.put('/core-values/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, icon_class, display_order, is_active } = req.body;

    await db.query(
      'UPDATE core_values SET title = ?, description = ?, icon_class = ?, display_order = ?, is_active = ?, updated_at = NOW() WHERE id = ?',
      [title, description, icon_class, display_order, is_active !== undefined ? is_active : true, id]
    );

    res.json({
      success: true,
      message: 'Core value updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating core value'
    });
  }
});

// DELETE /api/vision-mission/core-values/:id - Delete core value
router.delete('/core-values/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM core_values WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Core value deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting core value'
    });
  }
});

module.exports = router;
