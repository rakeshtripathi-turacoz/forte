const express = require('express');
const router = express.Router();
const db = require('../config/database');

// ============================================
// 1. PAGE HEADER ROUTES
// ============================================

// GET page header
router.get('/header', async (req, res) => {
  try {
    const [header] = await db.query(
      'SELECT * FROM career_page_header WHERE is_active = TRUE LIMIT 1'
    );
    res.json({ success: true, data: header[0] || null });
  } catch (error) {
    console.error('Error fetching page header:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch page header', error: error.message });
  }
});

// PUT update page header
router.put('/header', async (req, res) => {
  try {
    const { title, subtitle } = req.body;

    // Check if header exists
    const [existing] = await db.query('SELECT id FROM career_page_header LIMIT 1');

    if (existing.length > 0) {
      // Update existing
      await db.query(
        'UPDATE career_page_header SET title = ?, subtitle = ? WHERE id = ?',
        [title, subtitle, existing[0].id]
      );
    } else {
      // Insert new
      await db.query(
        'INSERT INTO career_page_header (title, subtitle) VALUES (?, ?)',
        [title, subtitle]
      );
    }

    res.json({ success: true, message: 'Page header updated successfully' });
  } catch (error) {
    console.error('Error updating page header:', error);
    res.status(500).json({ success: false, message: 'Failed to update page header', error: error.message });
  }
});

// ============================================
// 2. BENEFITS ROUTES
// ============================================

// GET all benefits
router.get('/benefits', async (req, res) => {
  try {
    const [benefits] = await db.query(
      'SELECT * FROM career_benefits WHERE is_active = TRUE ORDER BY display_order ASC'
    );
    res.json({ success: true, data: benefits });
  } catch (error) {
    console.error('Error fetching benefits:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch benefits', error: error.message });
  }
});

// POST create benefit
router.post('/benefits', async (req, res) => {
  try {
    const { title, description, icon, icon_bg_color, display_order } = req.body;

    const [result] = await db.query(
      'INSERT INTO career_benefits (title, description, icon, icon_bg_color, display_order) VALUES (?, ?, ?, ?, ?)',
      [title, description, icon, icon_bg_color || '#B91C1C', display_order || 0]
    );

    res.json({ success: true, message: 'Benefit created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating benefit:', error);
    res.status(500).json({ success: false, message: 'Failed to create benefit', error: error.message });
  }
});

// PUT update benefit
router.put('/benefits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, icon, icon_bg_color, display_order } = req.body;

    await db.query(
      'UPDATE career_benefits SET title = ?, description = ?, icon = ?, icon_bg_color = ?, display_order = ? WHERE id = ?',
      [title, description, icon, icon_bg_color, display_order, id]
    );

    res.json({ success: true, message: 'Benefit updated successfully' });
  } catch (error) {
    console.error('Error updating benefit:', error);
    res.status(500).json({ success: false, message: 'Failed to update benefit', error: error.message });
  }
});

// DELETE benefit
router.delete('/benefits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM career_benefits WHERE id = ?', [id]);
    res.json({ success: true, message: 'Benefit deleted successfully' });
  } catch (error) {
    console.error('Error deleting benefit:', error);
    res.status(500).json({ success: false, message: 'Failed to delete benefit', error: error.message });
  }
});

// ============================================
// 3. JOB OPENINGS ROUTES
// ============================================

// GET all job openings
router.get('/openings', async (req, res) => {
  try {
    const { status, department } = req.query;
    let query = 'SELECT * FROM career_openings WHERE is_active = TRUE';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }

    query += ' ORDER BY display_order ASC, posted_date DESC';

    const [openings] = await db.query(query, params);
    res.json({ success: true, data: openings });
  } catch (error) {
    console.error('Error fetching openings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch openings', error: error.message });
  }
});

// GET single job opening
router.get('/openings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [opening] = await db.query('SELECT * FROM career_openings WHERE id = ?', [id]);

    if (opening.length === 0) {
      return res.status(404).json({ success: false, message: 'Opening not found' });
    }

    res.json({ success: true, data: opening[0] });
  } catch (error) {
    console.error('Error fetching opening:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch opening', error: error.message });
  }
});

// POST create job opening
router.post('/openings', async (req, res) => {
  try {
    const {
      title,
      department,
      employment_type,
      experience_required,
      qualification_required,
      job_description,
      responsibilities,
      requirements,
      salary_range,
      application_deadline,
      posted_date,
      status,
      location,
      apply_url,
      display_order,
      is_active
    } = req.body;

    console.log('➕ Creating new job opening');
    console.log('📦 Request body:', req.body);

    const [result] = await db.query(
      `INSERT INTO career_openings
       (title, department, employment_type, experience_required, qualification_required,
        job_description, responsibilities, requirements, salary_range, application_deadline,
        posted_date, status, location, apply_url, display_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        department,
        employment_type || 'Full-time',
        experience_required,
        qualification_required,
        job_description,
        responsibilities,
        requirements,
        salary_range,
        application_deadline,
        posted_date || new Date().toISOString().split('T')[0],
        status || 'Open',
        location || 'Campus',
        apply_url,
        display_order || 0,
        is_active !== undefined ? is_active : true
      ]
    );

    console.log('✅ Job opening created successfully');

    res.json({ success: true, message: 'Job opening created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating opening:', error);
    res.status(500).json({ success: false, message: 'Failed to create opening', error: error.message });
  }
});

// PUT update job opening
router.put('/openings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      department,
      employment_type,
      experience_required,
      qualification_required,
      job_description,
      responsibilities,
      requirements,
      salary_range,
      application_deadline,
      posted_date,
      status,
      location,
      apply_url,
      display_order,
      is_active
    } = req.body;

    console.log('🔄 Updating job opening ID:', id);
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));

    // Convert empty strings to null for optional fields
    const formatField = (field) => (field && field.trim() !== '' ? field : null);

    const updateData = {
      title: title || '',
      department: department || '',
      employment_type: employment_type || 'Full-time',
      experience_required: formatField(experience_required),
      qualification_required: formatField(qualification_required),
      job_description: formatField(job_description),
      responsibilities: formatField(responsibilities),
      requirements: formatField(requirements),
      salary_range: formatField(salary_range),
      application_deadline: formatField(application_deadline),
      posted_date: formatField(posted_date),
      status: status || 'Open',
      location: location || 'Campus',
      apply_url: formatField(apply_url),
      display_order: display_order || 0,
      is_active: is_active !== undefined ? is_active : true
    };

    console.log('🔧 Prepared update data:', JSON.stringify(updateData, null, 2));

    await db.query(
      `UPDATE career_openings SET
       title = ?, department = ?, employment_type = ?, experience_required = ?,
       qualification_required = ?, job_description = ?, responsibilities = ?,
       requirements = ?, salary_range = ?, application_deadline = ?, posted_date = ?,
       status = ?, location = ?, apply_url = ?, display_order = ?, is_active = ?
       WHERE id = ?`,
      [
        updateData.title,
        updateData.department,
        updateData.employment_type,
        updateData.experience_required,
        updateData.qualification_required,
        updateData.job_description,
        updateData.responsibilities,
        updateData.requirements,
        updateData.salary_range,
        updateData.application_deadline,
        updateData.posted_date,
        updateData.status,
        updateData.location,
        updateData.apply_url,
        updateData.display_order,
        updateData.is_active,
        id
      ]
    );

    console.log('✅ Job opening updated successfully');
    res.json({ success: true, message: 'Job opening updated successfully' });
  } catch (error) {
    console.error('❌ Error updating opening:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ SQL Error code:', error.code);
    console.error('❌ SQL Error:', error.sqlMessage);
    res.status(500).json({
      success: false,
      message: 'Failed to update opening',
      error: error.message,
      sqlError: error.sqlMessage
    });
  }
});

// DELETE job opening
router.delete('/openings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM career_openings WHERE id = ?', [id]);
    res.json({ success: true, message: 'Job opening deleted successfully' });
  } catch (error) {
    console.error('Error deleting opening:', error);
    res.status(500).json({ success: false, message: 'Failed to delete opening', error: error.message });
  }
});

// ============================================
// 4. APPLICATION STEPS ROUTES
// ============================================

// GET all application steps
router.get('/application-steps', async (req, res) => {
  try {
    const [steps] = await db.query(
      'SELECT * FROM career_application_steps WHERE is_active = TRUE ORDER BY display_order ASC, step_number ASC'
    );
    res.json({ success: true, data: steps });
  } catch (error) {
    console.error('Error fetching application steps:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch application steps', error: error.message });
  }
});

// POST create application step
router.post('/application-steps', async (req, res) => {
  try {
    const { step_number, step_title, step_description, icon, display_order } = req.body;

    const [result] = await db.query(
      'INSERT INTO career_application_steps (step_number, step_title, step_description, icon, display_order) VALUES (?, ?, ?, ?, ?)',
      [step_number, step_title, step_description, icon || 'fas fa-check', display_order || 0]
    );

    res.json({ success: true, message: 'Application step created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating application step:', error);
    res.status(500).json({ success: false, message: 'Failed to create application step', error: error.message });
  }
});

// PUT update application step
router.put('/application-steps/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { step_number, step_title, step_description, icon, display_order } = req.body;

    await db.query(
      'UPDATE career_application_steps SET step_number = ?, step_title = ?, step_description = ?, icon = ?, display_order = ? WHERE id = ?',
      [step_number, step_title, step_description, icon, display_order, id]
    );

    res.json({ success: true, message: 'Application step updated successfully' });
  } catch (error) {
    console.error('Error updating application step:', error);
    res.status(500).json({ success: false, message: 'Failed to update application step', error: error.message });
  }
});

// DELETE application step
router.delete('/application-steps/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM career_application_steps WHERE id = ?', [id]);
    res.json({ success: true, message: 'Application step deleted successfully' });
  } catch (error) {
    console.error('Error deleting application step:', error);
    res.status(500).json({ success: false, message: 'Failed to delete application step', error: error.message });
  }
});

// ============================================
// 5. GENERAL APPLICATION ROUTES
// ============================================

// GET general application section
router.get('/general-application', async (req, res) => {
  try {
    const [section] = await db.query(
      'SELECT * FROM career_general_application WHERE is_active = TRUE LIMIT 1'
    );
    res.json({ success: true, data: section[0] || null });
  } catch (error) {
    console.error('Error fetching general application:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch general application', error: error.message });
  }
});

// PUT update general application
router.put('/general-application', async (req, res) => {
  try {
    const {
      section_title,
      section_description,
      contact_email,
      contact_phone,
      additional_info,
      button_text,
      button_link
    } = req.body;

    // Check if exists
    const [existing] = await db.query('SELECT id FROM career_general_application LIMIT 1');

    if (existing.length > 0) {
      await db.query(
        `UPDATE career_general_application SET
         section_title = ?, section_description = ?, contact_email = ?,
         contact_phone = ?, additional_info = ?, button_text = ?, button_link = ?
         WHERE id = ?`,
        [section_title, section_description, contact_email, contact_phone, additional_info, button_text, button_link, existing[0].id]
      );
    } else {
      await db.query(
        `INSERT INTO career_general_application
         (section_title, section_description, contact_email, contact_phone, additional_info, button_text, button_link)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [section_title, section_description, contact_email, contact_phone, additional_info, button_text, button_link]
      );
    }

    res.json({ success: true, message: 'General application section updated successfully' });
  } catch (error) {
    console.error('Error updating general application:', error);
    res.status(500).json({ success: false, message: 'Failed to update general application', error: error.message });
  }
});

// ============================================
// 6. HR CONTACTS ROUTES
// ============================================

// GET all HR contacts
router.get('/hr-contacts', async (req, res) => {
  try {
    const [contacts] = await db.query(
      'SELECT * FROM career_hr_contacts WHERE is_active = TRUE ORDER BY display_order ASC'
    );
    res.json({ success: true, data: contacts });
  } catch (error) {
    console.error('Error fetching HR contacts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch HR contacts', error: error.message });
  }
});

// POST create HR contact
router.post('/hr-contacts', async (req, res) => {
  try {
    const { contact_type, contact_title, contact_details, display_order } = req.body;

    const [result] = await db.query(
      'INSERT INTO career_hr_contacts (contact_type, contact_title, contact_details, display_order) VALUES (?, ?, ?, ?)',
      [contact_type, contact_title, contact_details, display_order || 0]
    );

    res.json({ success: true, message: 'HR contact created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating HR contact:', error);
    res.status(500).json({ success: false, message: 'Failed to create HR contact', error: error.message });
  }
});

// PUT update HR contact
router.put('/hr-contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { contact_type, contact_title, contact_details, display_order } = req.body;

    await db.query(
      'UPDATE career_hr_contacts SET contact_type = ?, contact_title = ?, contact_details = ?, display_order = ? WHERE id = ?',
      [contact_type, contact_title, contact_details, display_order, id]
    );

    res.json({ success: true, message: 'HR contact updated successfully' });
  } catch (error) {
    console.error('Error updating HR contact:', error);
    res.status(500).json({ success: false, message: 'Failed to update HR contact', error: error.message });
  }
});

// DELETE HR contact
router.delete('/hr-contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM career_hr_contacts WHERE id = ?', [id]);
    res.json({ success: true, message: 'HR contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting HR contact:', error);
    res.status(500).json({ success: false, message: 'Failed to delete HR contact', error: error.message });
  }
});

module.exports = router;
