const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory for logos
const logoUploadsDir = path.join(__dirname, '../uploads/logos');
if (!fs.existsSync(logoUploadsDir)) {
  fs.mkdirSync(logoUploadsDir, { recursive: true });
}

// Configure multer for logo uploads
const logoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, logoUploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const logoFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.includes('image');

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const logoUpload = multer({
  storage: logoStorage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: logoFileFilter
});

// GET /api/placements - Get all placements
router.get('/', async (req, res) => {
  try {
    const { batch_year, company, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT p.*, c.course_name, c.course_code
      FROM placements p
      LEFT JOIN courses c ON p.course_id = c.id
      WHERE p.is_active = TRUE
    `;
    const params = [];

    if (batch_year) {
      query += ' AND p.batch_year = ?';
      params.push(batch_year);
    }

    if (company) {
      query += ' AND p.company_name LIKE ?';
      params.push(`%${company}%`);
    }

    query += ' ORDER BY p.placement_date DESC, p.batch_year DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [data] = await db.query(query, params);

    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM placements WHERE is_active = TRUE'
    );

    res.json({
      success: true,
      data,
      total: countResult[0].total
    });
  } catch (error) {
    console.error('Error fetching placements:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching placements'
    });
  }
});

// GET /api/placements/stats - Get placement statistics
router.get('/stats', async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT
        batch_year,
        COUNT(*) as total_placements,
        ROUND(AVG(package_lpa), 2) as avg_package,
        MAX(package_lpa) as highest_package,
        MIN(package_lpa) as lowest_package
      FROM placements
      WHERE is_active = TRUE AND package_lpa IS NOT NULL
      GROUP BY batch_year
      ORDER BY batch_year DESC
    `);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching placement statistics'
    });
  }
});

// GET /api/placements/:id - Get single placement
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT p.*, c.course_name
       FROM placements p
       LEFT JOIN courses c ON p.course_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Placement record not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching placement'
    });
  }
});

// POST /api/placements - Add placement record
router.post('/', async (req, res) => {
  try {
    const {
      student_name,
      course_id,
      batch_year,
      company_name,
      package_lpa,
      job_role,
      placement_date,
      student_photo_url,
      is_featured
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO placements
       (student_name, course_id, batch_year, company_name, package_lpa, job_role, placement_date, student_photo_url, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_name, course_id, batch_year, company_name, package_lpa, job_role, placement_date, student_photo_url, is_featured || false]
    );

    res.json({
      success: true,
      message: 'Placement record added successfully',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding placement record'
    });
  }
});

// PUT /api/placements/:id - Update placement record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      student_name,
      course_id,
      batch_year,
      company_name,
      package_lpa,
      job_role,
      placement_date,
      student_photo_url,
      is_featured,
      is_active
    } = req.body;

    await db.query(
      `UPDATE placements SET
        student_name = ?,
        course_id = ?,
        batch_year = ?,
        company_name = ?,
        package_lpa = ?,
        job_role = ?,
        placement_date = ?,
        student_photo_url = ?,
        is_featured = ?,
        is_active = ?
      WHERE id = ?`,
      [student_name, course_id, batch_year, company_name, package_lpa, job_role, placement_date, student_photo_url, is_featured, is_active !== undefined ? is_active : true, id]
    );

    res.json({
      success: true,
      message: 'Placement record updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating placement record'
    });
  }
});

// DELETE /api/placements/:id - Delete placement record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM placements WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Placement record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting placement record'
    });
  }
});

// ============================================
// PLACEMENT PAGE CONTENT MANAGEMENT
// ============================================

// GET /api/placements/content/coordinator - Get coordinator info
router.get('/content/coordinator', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM placement_coordinator WHERE is_active = TRUE LIMIT 1');
    res.json({
      success: true,
      data: rows[0] || null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching coordinator info' });
  }
});

// PUT /api/placements/content/coordinator - Update coordinator info
router.put('/content/coordinator', async (req, res) => {
  try {
    const { name, title, message_title, message_paragraph_1, message_paragraph_2, email, phone, photo_url } = req.body;

    const [existing] = await db.query('SELECT id FROM placement_coordinator LIMIT 1');

    if (existing.length > 0) {
      await db.query(
        `UPDATE placement_coordinator SET name = ?, title = ?, message_title = ?, message_paragraph_1 = ?,
         message_paragraph_2 = ?, email = ?, phone = ?, photo_url = ? WHERE id = ?`,
        [name, title, message_title, message_paragraph_1, message_paragraph_2, email, phone, photo_url, existing[0].id]
      );
    } else {
      await db.query(
        `INSERT INTO placement_coordinator (name, title, message_title, message_paragraph_1, message_paragraph_2, email, phone, photo_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, title, message_title, message_paragraph_1, message_paragraph_2, email, phone, photo_url]
      );
    }

    res.json({ success: true, message: 'Coordinator info updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating coordinator info' });
  }
});

// GET /api/placements/content/training-programs - Get all training programs
router.get('/content/training-programs', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM placement_training_programs WHERE is_active = TRUE ORDER BY display_order ASC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching training programs' });
  }
});

// POST /api/placements/content/training-programs - Create training program
router.post('/content/training-programs', async (req, res) => {
  try {
    const { program_name, icon, icon_bg_color, description, features, display_order } = req.body;
    const [result] = await db.query(
      `INSERT INTO placement_training_programs (program_name, icon, icon_bg_color, description, features, display_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [program_name, icon, icon_bg_color || 'bg-crimson', description, features, display_order || 0]
    );
    res.json({ success: true, message: 'Training program created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating training program' });
  }
});

// PUT /api/placements/content/training-programs/:id - Update training program
router.put('/content/training-programs/:id', async (req, res) => {
  try {
    console.log('🔄 Updating training program ID:', req.params.id);
    console.log('📦 Request body:', req.body);

    const { program_name, icon, icon_bg_color, description, features, display_order, is_active } = req.body;

    // Validate required fields
    if (!program_name) {
      return res.status(400).json({ success: false, message: 'Program name is required' });
    }

    await db.query(
      `UPDATE placement_training_programs SET program_name = ?, icon = ?, icon_bg_color = ?, description = ?,
       features = ?, display_order = ?, is_active = ? WHERE id = ?`,
      [program_name, icon, icon_bg_color, description, features, display_order, is_active !== undefined ? is_active : true, req.params.id]
    );

    console.log('✅ Training program updated successfully');
    res.json({ success: true, message: 'Training program updated' });
  } catch (error) {
    console.error('❌ Error updating training program:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ success: false, message: 'Error updating training program: ' + error.message });
  }
});

// DELETE /api/placements/content/training-programs/:id - Delete training program
router.delete('/content/training-programs/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM placement_training_programs WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Training program deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting training program' });
  }
});

// GET /api/placements/content/recruiters - Get all recruiters
router.get('/content/recruiters', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM placement_recruiters WHERE is_active = TRUE ORDER BY display_order ASC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching recruiters' });
  }
});

// POST /api/placements/content/recruiters - Create recruiter
router.post('/content/recruiters', async (req, res) => {
  try {
    console.log('Received recruiter data:', req.body);

    const { company_name, logo_icon, website_url, sector, display_order, logo_url } = req.body;

    // Validate required fields
    if (!company_name) {
      return res.status(400).json({ success: false, message: 'Company name is required' });
    }

    const [result] = await db.query(
      `INSERT INTO placement_recruiters (company_name, logo_url, logo_icon, website_url, sector, display_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [company_name, logo_url || '', logo_icon || 'fas fa-building', website_url || '', sector || '', display_order || 0]
    );

    console.log('Recruiter created successfully with ID:', result.insertId);
    res.json({ success: true, message: 'Recruiter created', id: result.insertId });
  } catch (error) {
    console.error('Error creating recruiter - Full error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, message: 'Error creating recruiter: ' + error.message });
  }
});

// PUT /api/placements/content/recruiters/:id - Update recruiter
router.put('/content/recruiters/:id', async (req, res) => {
  try {
    console.log('Updating recruiter:', req.params.id);
    console.log('Received data:', req.body);

    const { company_name, logo_icon, website_url, sector, display_order, is_active, logo_url } = req.body;

    // Validate required fields
    if (!company_name) {
      return res.status(400).json({ success: false, message: 'Company name is required' });
    }

    // Get existing recruiter data first
    const [existing] = await db.query('SELECT * FROM placement_recruiters WHERE id = ?', [req.params.id]);

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Recruiter not found' });
    }

    // Keep existing logo_url or use provided one
    const finalLogoUrl = logo_url !== undefined ? logo_url : existing[0].logo_url;

    await db.query(
      `UPDATE placement_recruiters SET company_name = ?, logo_url = ?, logo_icon = ?, website_url = ?,
       sector = ?, display_order = ?, is_active = ? WHERE id = ?`,
      [company_name, finalLogoUrl || '', logo_icon || 'fas fa-building', website_url || '', sector || '', display_order || 0, is_active !== undefined ? is_active : true, req.params.id]
    );

    console.log('Recruiter updated successfully');
    res.json({ success: true, message: 'Recruiter updated' });
  } catch (error) {
    console.error('Error updating recruiter - Full error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, message: 'Error updating recruiter: ' + error.message });
  }
});

// DELETE /api/placements/content/recruiters/:id - Delete recruiter
router.delete('/content/recruiters/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM placement_recruiters WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Recruiter deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting recruiter' });
  }
});

// GET /api/placements/content/statistics - Get placement page statistics
router.get('/content/statistics', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM placement_statistics WHERE is_active = TRUE ORDER BY display_order ASC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching statistics' });
  }
});

// POST /api/placements/content/statistics - Create statistic
router.post('/content/statistics', async (req, res) => {
  try {
    const { stat_label, stat_value, icon, description, academic_year, display_order } = req.body;
    const [result] = await db.query(
      `INSERT INTO placement_statistics (stat_label, stat_value, icon, description, academic_year, display_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [stat_label, stat_value, icon || 'fas fa-chart-line', description, academic_year, display_order || 0]
    );
    res.json({ success: true, message: 'Statistic created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating statistic' });
  }
});

// PUT /api/placements/content/statistics/:id - Update statistic
router.put('/content/statistics/:id', async (req, res) => {
  try {
    const { stat_label, stat_value, icon, description, academic_year, display_order, is_active } = req.body;
    await db.query(
      `UPDATE placement_statistics SET stat_label = ?, stat_value = ?, icon = ?, description = ?,
       academic_year = ?, display_order = ?, is_active = ? WHERE id = ?`,
      [stat_label, stat_value, icon, description, academic_year, display_order, is_active !== undefined ? is_active : true, req.params.id]
    );
    res.json({ success: true, message: 'Statistic updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating statistic' });
  }
});

// DELETE /api/placements/content/statistics/:id - Delete statistic
router.delete('/content/statistics/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM placement_statistics WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Statistic deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting statistic' });
  }
});

// GET /api/placements/content/contact-info - Get contact information
router.get('/content/contact-info', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM placement_contact_info WHERE is_active = TRUE ORDER BY display_order ASC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching contact info' });
  }
});

// POST /api/placements/content/contact-info - Create contact info
router.post('/content/contact-info', async (req, res) => {
  try {
    const { contact_type, title, email, phone, office_hours, additional_info, button_text, button_link, display_order } = req.body;
    const [result] = await db.query(
      `INSERT INTO placement_contact_info (contact_type, title, email, phone, office_hours, additional_info, button_text, button_link, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [contact_type, title, email, phone, office_hours, additional_info, button_text, button_link, display_order || 0]
    );
    res.json({ success: true, message: 'Contact info created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating contact info' });
  }
});

// PUT /api/placements/content/contact-info/:id - Update contact info
router.put('/content/contact-info/:id', async (req, res) => {
  try {
    const { contact_type, title, email, phone, office_hours, additional_info, button_text, button_link, display_order, is_active } = req.body;
    await db.query(
      `UPDATE placement_contact_info SET contact_type = ?, title = ?, email = ?, phone = ?, office_hours = ?,
       additional_info = ?, button_text = ?, button_link = ?, display_order = ?, is_active = ? WHERE id = ?`,
      [contact_type, title, email, phone, office_hours, additional_info, button_text, button_link, display_order,
       is_active !== undefined ? is_active : true, req.params.id]
    );
    res.json({ success: true, message: 'Contact info updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating contact info' });
  }
});

// DELETE /api/placements/content/contact-info/:id - Delete contact info
router.delete('/content/contact-info/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM placement_contact_info WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Contact info deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting contact info' });
  }
});

module.exports = router;
