const express = require('express');
const router = express.Router();
const db = require('../config/database');

// ============================================================================
// GET /api/about-page - Get About Page Content
// ============================================================================
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM about_page WHERE is_active = TRUE LIMIT 1'
    );

    res.json({
      success: true,
      data: rows[0] || null
    });
  } catch (error) {
    console.error('Error fetching about page:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching about page',
      error: error.message
    });
  }
});

// ============================================================================
// PUT /api/about-page - Update About Page Content
// ============================================================================
router.put('/', async (req, res) => {
  try {
    const {
      page_title,
      page_subtitle,
      banner_image_url,
      overview_heading,
      overview_description,
      approval_badge_text,
      logo_tagline
    } = req.body;

    // Check if record exists
    const [existing] = await db.query('SELECT id FROM about_page LIMIT 1');

    if (existing.length > 0) {
      // Update existing
      await db.query(
        `UPDATE about_page SET
          page_title = ?,
          page_subtitle = ?,
          banner_image_url = ?,
          overview_heading = ?,
          overview_description = ?,
          approval_badge_text = ?,
          logo_tagline = ?,
          updated_at = NOW()
        WHERE id = ?`,
        [
          page_title,
          page_subtitle,
          banner_image_url,
          overview_heading,
          overview_description,
          approval_badge_text,
          logo_tagline,
          existing[0].id
        ]
      );
    } else {
      // Insert new
      await db.query(
        `INSERT INTO about_page (
          page_title,
          page_subtitle,
          banner_image_url,
          overview_heading,
          overview_description,
          approval_badge_text,
          logo_tagline
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          page_title,
          page_subtitle,
          banner_image_url,
          overview_heading,
          overview_description,
          approval_badge_text,
          logo_tagline
        ]
      );
    }

    res.json({
      success: true,
      message: 'About page updated successfully'
    });
  } catch (error) {
    console.error('Error updating about page:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating about page',
      error: error.message
    });
  }
});

// ============================================================================
// GET /api/about-page/approvals - Get All Approvals
// ============================================================================
router.get('/approvals', async (req, res) => {
  try {
    const [approvals] = await db.query(
      'SELECT * FROM about_approvals WHERE is_active = TRUE ORDER BY display_order'
    );

    res.json({
      success: true,
      data: approvals
    });
  } catch (error) {
    console.error('Error fetching approvals:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching approvals',
      error: error.message
    });
  }
});

// ============================================================================
// GET /api/about-page/approvals/:id/documents - Get Documents for Approval
// ============================================================================
router.get('/approvals/:id/documents', async (req, res) => {
  try {
    const { id } = req.params;

    const [documents] = await db.query(
      `SELECT * FROM about_approval_documents
       WHERE approval_id = ? AND is_active = TRUE
       ORDER BY display_order DESC`,
      [id]
    );

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Error fetching approval documents:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching approval documents',
      error: error.message
    });
  }
});

module.exports = router;
