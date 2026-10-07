const express = require('express');
const router = express.Router();
const db = require('../config/database');

// ============================================================================
// GET COMPLETE HOME PAGE DATA - Simple queries (no stored procedure)
// ============================================================================
router.get('/complete', async (req, res) => {
  try {
    // Simple individual queries instead of stored procedure
    const [hero] = await db.query('SELECT * FROM home_hero_banner WHERE is_active = TRUE LIMIT 1');
    const [stats] = await db.query('SELECT * FROM home_statistics_counter WHERE is_active = TRUE ORDER BY display_order');
    const [programs] = await db.query('SELECT * FROM home_featured_programs WHERE is_active = TRUE ORDER BY display_order');

    // Fetch from new announcements table instead of home_announcements
    const [announcements] = await db.query('SELECT * FROM announcements WHERE is_active = TRUE ORDER BY announcement_date DESC LIMIT 10');

    const [whyChoose] = await db.query('SELECT * FROM home_why_choose_features WHERE is_active = TRUE ORDER BY display_order');
    const [testimonials] = await db.query('SELECT * FROM home_student_testimonials WHERE is_active = TRUE ORDER BY display_order');
    const [cta] = await db.query('SELECT * FROM home_cta_section WHERE is_active = TRUE LIMIT 1');

    res.json({
      success: true,
      data: {
        hero: hero[0] || null,
        stats: stats || [],
        programs: programs || [],
        announcements: announcements || [],
        whyChoose: whyChoose || [],
        testimonials: testimonials || [],
        cta: cta[0] || null
      }
    });
  } catch (error) {
    console.error('Error fetching home page data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching home page data',
      error: error.message
    });
  }
});

// ============================================================================
// HERO BANNER SECTION
// ============================================================================

// GET hero section
router.get('/hero', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM home_hero_banner WHERE is_active = TRUE LIMIT 1'
    );
    res.json({
      success: true,
      data: rows[0] || null
    });
  } catch (error) {
    console.error('Error fetching hero section:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hero section'
    });
  }
});

// UPDATE hero section
router.put('/hero', async (req, res) => {
  try {
    const {
      hero_title,
      hero_subtitle,
      hero_description,
      hero_background_image,
      primary_btn_text,
      secondary_btn_text,
      secondary_btn_link
    } = req.body;

    await db.query(
      `UPDATE home_hero_banner SET
        hero_title = ?,
        hero_subtitle = ?,
        hero_description = ?,
        hero_background_image = ?,
        primary_btn_text = ?,
        secondary_btn_text = ?,
        secondary_btn_link = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1`,
      [hero_title, hero_subtitle, hero_description, hero_background_image, primary_btn_text, secondary_btn_text, secondary_btn_link]
    );

    const [updated] = await db.query('SELECT * FROM home_hero_banner WHERE id = 1');

    res.json({
      success: true,
      message: 'Hero section updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating hero section:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating hero section'
    });
  }
});

// ============================================================================
// STATISTICS SECTION
// ============================================================================

// GET statistics
router.get('/stats', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM home_statistics_counter WHERE is_active = TRUE ORDER BY display_order'
    );
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

// ADD new statistic
router.post('/stats', async (req, res) => {
  try {
    const { stat_value, stat_title, display_order } = req.body;

    const [result] = await db.query(
      'INSERT INTO home_statistics_counter (stat_value, stat_title, display_order) VALUES (?, ?, ?)',
      [stat_value, stat_title, display_order || 0]
    );

    res.json({
      success: true,
      message: 'Statistic added successfully',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding statistic'
    });
  }
});

// UPDATE statistic
router.put('/stats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { stat_value, stat_title, display_order } = req.body;

    await db.query(
      'UPDATE home_statistics_counter SET stat_value = ?, stat_title = ?, display_order = ? WHERE id = ?',
      [stat_value, stat_title, display_order, id]
    );

    res.json({
      success: true,
      message: 'Statistic updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating statistic'
    });
  }
});

// DELETE statistic
router.delete('/stats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM home_statistics_counter WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Statistic deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting statistic'
    });
  }
});

// ============================================================================
// FEATURED PROGRAMS SECTION
// ============================================================================

// GET programs
router.get('/programs', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM home_featured_programs WHERE is_active = TRUE ORDER BY display_order'
    );
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching programs'
    });
  }
});

// ADD new program
router.post('/programs', async (req, res) => {
  try {
    const { program_title, program_description, program_icon, program_link, display_order } = req.body;

    const [result] = await db.query(
      'INSERT INTO home_featured_programs (program_title, program_description, program_icon, program_link, display_order) VALUES (?, ?, ?, ?, ?)',
      [program_title, program_description, program_icon, program_link, display_order || 0]
    );

    res.json({
      success: true,
      message: 'Program added successfully',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding program'
    });
  }
});

// UPDATE program
router.put('/programs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { program_title, program_description, program_icon, program_link, display_order } = req.body;

    await db.query(
      'UPDATE home_featured_programs SET program_title = ?, program_description = ?, program_icon = ?, program_link = ?, display_order = ? WHERE id = ?',
      [program_title, program_description, program_icon, program_link, display_order, id]
    );

    res.json({
      success: true,
      message: 'Program updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating program'
    });
  }
});

// DELETE program
router.delete('/programs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM home_featured_programs WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Program deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting program'
    });
  }
});

// ============================================================================
// ANNOUNCEMENTS SECTION
// ============================================================================

// GET announcements
router.get('/announcements', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM home_announcements WHERE is_active = TRUE ORDER BY announcement_date DESC LIMIT 10'
    );
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching announcements'
    });
  }
});

// ADD new announcement
router.post('/announcements', async (req, res) => {
  try {
    const { announcement_title, announcement_date, announcement_link, is_featured } = req.body;

    const [result] = await db.query(
      'INSERT INTO home_announcements (announcement_title, announcement_date, announcement_link, is_featured) VALUES (?, ?, ?, ?)',
      [announcement_title, announcement_date, announcement_link || '#', is_featured || false]
    );

    res.json({
      success: true,
      message: 'Announcement added successfully',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding announcement'
    });
  }
});

// UPDATE announcement
router.put('/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { announcement_title, announcement_date, announcement_link, is_featured } = req.body;

    await db.query(
      'UPDATE home_announcements SET announcement_title = ?, announcement_date = ?, announcement_link = ?, is_featured = ? WHERE id = ?',
      [announcement_title, announcement_date, announcement_link, is_featured, id]
    );

    res.json({
      success: true,
      message: 'Announcement updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating announcement'
    });
  }
});

// DELETE announcement
router.delete('/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM home_announcements WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting announcement'
    });
  }
});

// ============================================================================
// TESTIMONIALS SECTION
// ============================================================================

// GET testimonials
router.get('/testimonials', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM home_student_testimonials WHERE is_active = TRUE ORDER BY display_order'
    );
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching testimonials'
    });
  }
});

// ADD new testimonial
router.post('/testimonials', async (req, res) => {
  try {
    const { student_name, student_designation, student_avatar_initials, testimonial_text, rating, display_order } = req.body;

    const [result] = await db.query(
      'INSERT INTO home_student_testimonials (student_name, student_designation, student_avatar_initials, testimonial_text, rating, display_order) VALUES (?, ?, ?, ?, ?, ?)',
      [student_name, student_designation, student_avatar_initials, testimonial_text, rating || 5, display_order || 0]
    );

    res.json({
      success: true,
      message: 'Testimonial added successfully',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding testimonial'
    });
  }
});

// UPDATE testimonial
router.put('/testimonials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { student_name, student_designation, student_avatar_initials, testimonial_text, rating, display_order } = req.body;

    await db.query(
      'UPDATE home_student_testimonials SET student_name = ?, student_designation = ?, student_avatar_initials = ?, testimonial_text = ?, rating = ?, display_order = ? WHERE id = ?',
      [student_name, student_designation, student_avatar_initials, testimonial_text, rating, display_order, id]
    );

    res.json({
      success: true,
      message: 'Testimonial updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating testimonial'
    });
  }
});

// DELETE testimonial
router.delete('/testimonials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM home_student_testimonials WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting testimonial'
    });
  }
});

// ============================================================================
// WHY CHOOSE US SECTION
// ============================================================================

// GET why choose features
router.get('/why-choose', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM home_why_choose_features WHERE is_active = TRUE ORDER BY display_order'
    );
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching why choose features'
    });
  }
});

// ADD new why choose feature
router.post('/why-choose', async (req, res) => {
  try {
    const { feature_icon, feature_title, feature_description, display_order } = req.body;

    const [result] = await db.query(
      'INSERT INTO home_why_choose_features (feature_icon, feature_title, feature_description, display_order) VALUES (?, ?, ?, ?)',
      [feature_icon, feature_title, feature_description, display_order || 0]
    );

    res.json({
      success: true,
      message: 'Feature added successfully',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding feature'
    });
  }
});

// UPDATE why choose feature
router.put('/why-choose/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { feature_icon, feature_title, feature_description, display_order } = req.body;

    await db.query(
      'UPDATE home_why_choose_features SET feature_icon = ?, feature_title = ?, feature_description = ?, display_order = ? WHERE id = ?',
      [feature_icon, feature_title, feature_description, display_order, id]
    );

    res.json({
      success: true,
      message: 'Feature updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating feature'
    });
  }
});

// DELETE why choose feature
router.delete('/why-choose/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM home_why_choose_features WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Feature deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting feature'
    });
  }
});

// ============================================================================
// CTA SECTION
// ============================================================================

// GET CTA section
router.get('/cta', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM home_cta_section WHERE is_active = TRUE LIMIT 1'
    );
    res.json({
      success: true,
      data: rows[0] || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching CTA section'
    });
  }
});

// UPDATE CTA section
router.put('/cta', async (req, res) => {
  try {
    const { cta_title, cta_description, primary_btn_text, secondary_btn_text, secondary_btn_link } = req.body;

    await db.query(
      `UPDATE home_cta_section SET
        cta_title = ?,
        cta_description = ?,
        primary_btn_text = ?,
        secondary_btn_text = ?,
        secondary_btn_link = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1`,
      [cta_title, cta_description, primary_btn_text, secondary_btn_text, secondary_btn_link]
    );

    const [updated] = await db.query('SELECT * FROM home_cta_section WHERE id = 1');

    res.json({
      success: true,
      message: 'CTA section updated successfully',
      data: updated[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating CTA section'
    });
  }
});

module.exports = router;
