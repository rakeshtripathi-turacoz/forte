const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/home/complete - Get all home page data
router.get('/complete', async (req, res) => {
  try {
    // Call stored procedure to get all home page data
    const [results] = await db.query('CALL GetHomePageData()');

    // MySQL returns multiple result sets from stored procedure
    // results[0] = hero, results[1] = stats, etc.
    res.json({
      success: true,
      data: {
        hero: results[0][0] || null,
        stats: results[1] || [],
        programs: results[2] || [],
        announcements: results[3] || [],
        whyChoose: results[4] || [],
        testimonials: results[5] || [],
        cta: results[6][0] || null
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

// GET /api/home/hero - Get hero section
router.get('/hero', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM hero_section WHERE is_active = TRUE LIMIT 1'
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

// PUT /api/home/hero - Update hero section
router.put('/hero', async (req, res) => {
  try {
    const { title, subtitle, description, background_image_url, primary_button_text, secondary_button_text, secondary_button_link } = req.body;

    await db.query(
      `UPDATE hero_section SET
        title = ?,
        subtitle = ?,
        description = ?,
        background_image_url = ?,
        primary_button_text = ?,
        secondary_button_text = ?,
        secondary_button_link = ?
      WHERE id = 1`,
      [title, subtitle, description, background_image_url, primary_button_text, secondary_button_text, secondary_button_link]
    );

    res.json({
      success: true,
      message: 'Hero section updated successfully'
    });
  } catch (error) {
    console.error('Error updating hero section:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating hero section'
    });
  }
});

// GET /api/home/stats - Get statistics
router.get('/stats', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM statistics WHERE is_active = TRUE ORDER BY display_order'
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

// POST /api/home/stats - Add new statistic
router.post('/stats', async (req, res) => {
  try {
    const { stat_number, stat_label, display_order } = req.body;

    const [result] = await db.query(
      'INSERT INTO statistics (stat_number, stat_label, display_order) VALUES (?, ?, ?)',
      [stat_number, stat_label, display_order || 0]
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

// PUT /api/home/stats/:id - Update statistic
router.put('/stats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { stat_number, stat_label, display_order, is_active } = req.body;

    await db.query(
      'UPDATE statistics SET stat_number = ?, stat_label = ?, display_order = ?, is_active = ? WHERE id = ?',
      [stat_number, stat_label, display_order, is_active !== undefined ? is_active : true, id]
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

// DELETE /api/home/stats/:id - Delete statistic
router.delete('/stats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM statistics WHERE id = ?', [id]);

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

// GET /api/home/programs - Get featured programs
router.get('/programs', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM featured_programs WHERE is_active = TRUE ORDER BY display_order'
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

// POST /api/home/programs - Add new program
router.post('/programs', async (req, res) => {
  try {
    const { title, description, icon_class, link_url, display_order } = req.body;

    const [result] = await db.query(
      'INSERT INTO featured_programs (title, description, icon_class, link_url, display_order) VALUES (?, ?, ?, ?, ?)',
      [title, description, icon_class, link_url, display_order || 0]
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

// PUT /api/home/programs/:id - Update program
router.put('/programs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, icon_class, link_url, display_order, is_active } = req.body;

    await db.query(
      'UPDATE featured_programs SET title = ?, description = ?, icon_class = ?, link_url = ?, display_order = ?, is_active = ? WHERE id = ?',
      [title, description, icon_class, link_url, display_order, is_active !== undefined ? is_active : true, id]
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

// DELETE /api/home/programs/:id - Delete program
router.delete('/programs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM featured_programs WHERE id = ?', [id]);

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

// GET /api/home/announcements - Get announcements
router.get('/announcements', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const [rows] = await db.query(
      'SELECT * FROM announcements WHERE is_active = TRUE ORDER BY announcement_date DESC LIMIT ? OFFSET ?',
      [parseInt(limit), parseInt(offset)]
    );

    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM announcements WHERE is_active = TRUE'
    );

    res.json({
      success: true,
      data: rows,
      total: countResult[0].total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching announcements'
    });
  }
});

// POST /api/home/announcements - Add announcement
router.post('/announcements', async (req, res) => {
  try {
    const { title, announcement_date, link_url, is_featured } = req.body;

    const [result] = await db.query(
      'INSERT INTO announcements (title, announcement_date, link_url, is_featured) VALUES (?, ?, ?, ?)',
      [title, announcement_date, link_url || '#', is_featured || false]
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

// PUT /api/home/announcements/:id - Update announcement
router.put('/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, announcement_date, link_url, is_featured, is_active } = req.body;

    await db.query(
      'UPDATE announcements SET title = ?, announcement_date = ?, link_url = ?, is_featured = ?, is_active = ? WHERE id = ?',
      [title, announcement_date, link_url, is_featured, is_active !== undefined ? is_active : true, id]
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

// DELETE /api/home/announcements/:id - Delete announcement
router.delete('/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM announcements WHERE id = ?', [id]);

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

// GET /api/home/testimonials - Get testimonials
router.get('/testimonials', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM testimonials WHERE is_active = TRUE ORDER BY display_order'
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

// POST /api/home/testimonials - Add testimonial
router.post('/testimonials', async (req, res) => {
  try {
    const { student_name, designation, testimonial_text, avatar_initials, rating, display_order } = req.body;

    const [result] = await db.query(
      'INSERT INTO testimonials (student_name, designation, testimonial_text, avatar_initials, rating, display_order) VALUES (?, ?, ?, ?, ?, ?)',
      [student_name, designation, testimonial_text, avatar_initials, rating || 5, display_order || 0]
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

// PUT /api/home/testimonials/:id - Update testimonial
router.put('/testimonials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { student_name, designation, testimonial_text, avatar_initials, rating, display_order, is_active } = req.body;

    await db.query(
      'UPDATE testimonials SET student_name = ?, designation = ?, testimonial_text = ?, avatar_initials = ?, rating = ?, display_order = ?, is_active = ? WHERE id = ?',
      [student_name, designation, testimonial_text, avatar_initials, rating, display_order, is_active !== undefined ? is_active : true, id]
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

// DELETE /api/home/testimonials/:id - Delete testimonial
router.delete('/testimonials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM testimonials WHERE id = ?', [id]);

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

// GET /api/home/cta - Get CTA section
router.get('/cta', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM cta_section WHERE is_active = TRUE LIMIT 1'
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

// PUT /api/home/cta - Update CTA section
router.put('/cta', async (req, res) => {
  try {
    const { title, description, primary_button_text, secondary_button_text, secondary_button_link } = req.body;

    await db.query(
      `UPDATE cta_section SET
        title = ?,
        description = ?,
        primary_button_text = ?,
        secondary_button_text = ?,
        secondary_button_link = ?
      WHERE id = 1`,
      [title, description, primary_button_text, secondary_button_text, secondary_button_link]
    );

    res.json({
      success: true,
      message: 'CTA section updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating CTA section'
    });
  }
});

// GET /api/home/why-choose - Get why choose features
router.get('/why-choose', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM why_choose_features WHERE is_active = TRUE ORDER BY display_order'
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

// POST /api/home/why-choose - Add why choose feature
router.post('/why-choose', async (req, res) => {
  try {
    const { feature_icon, feature_title, feature_description, display_order } = req.body;

    const [result] = await db.query(
      'INSERT INTO why_choose_features (feature_icon, feature_title, feature_description, display_order) VALUES (?, ?, ?, ?)',
      [feature_icon, feature_title, feature_description, display_order || 0]
    );

    res.json({
      success: true,
      message: 'Why choose feature added successfully',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding why choose feature'
    });
  }
});

// PUT /api/home/why-choose/:id - Update why choose feature
router.put('/why-choose/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { feature_icon, feature_title, feature_description, display_order, is_active } = req.body;

    await db.query(
      'UPDATE why_choose_features SET feature_icon = ?, feature_title = ?, feature_description = ?, display_order = ?, is_active = ? WHERE id = ?',
      [feature_icon, feature_title, feature_description, display_order, is_active !== undefined ? is_active : true, id]
    );

    res.json({
      success: true,
      message: 'Why choose feature updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating why choose feature'
    });
  }
});

// DELETE /api/home/why-choose/:id - Delete why choose feature
router.delete('/why-choose/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM why_choose_features WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Why choose feature deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting why choose feature'
    });
  }
});

module.exports = router;
