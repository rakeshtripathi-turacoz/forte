const express = require('express');
const router = express.Router();
const db = require('../config/database');

// ============================================================================
// HEADER ROUTES
// ============================================================================

// Get header
router.get('/header', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM administration_header LIMIT 1'
    );
    res.json(rows[0] || null);
  } catch (error) {
    console.error('Error fetching header:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch header', error: error.message });
  }
});

// Update header
router.put('/header/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, description } = req.body;

    await db.query(
      `UPDATE administration_header
       SET title = ?, subtitle = ?, description = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, subtitle, description, id]
    );

    const [updated] = await db.query('SELECT * FROM administration_header WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Error updating header:', error);
    res.status(500).json({ success: false, message: 'Failed to update header', error: error.message });
  }
});

// ============================================================================
// DIRECTOR ROUTES
// ============================================================================

// Get director info
router.get('/director', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM director_info LIMIT 1'
    );
    res.json(rows[0] || null);
  } catch (error) {
    console.error('Error fetching director:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch director', error: error.message });
  }
});

// Update director
router.put('/director/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, designation, photo_url, office_description, message_link } = req.body;

    await db.query(
      `UPDATE director_info
       SET name = ?, designation = ?, photo_url = ?, office_description = ?, message_link = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, designation, photo_url, office_description, message_link, id]
    );

    const [updated] = await db.query('SELECT * FROM director_info WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Error updating director:', error);
    res.status(500).json({ success: false, message: 'Failed to update director', error: error.message });
  }
});

// ============================================================================
// ADMINISTRATIVE TEAM ROUTES
// ============================================================================

// Get all team members
router.get('/team', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM administrative_team ORDER BY display_order ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch team', error: error.message });
  }
});

// Get single team member
router.get('/team/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM administrative_team WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching team member:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch team member', error: error.message });
  }
});

// Create team member
router.post('/team', async (req, res) => {
  try {
    const { name, designation, department, photo_url, responsibilities, display_order } = req.body;

    if (!name || !designation) {
      return res.status(400).json({ success: false, message: 'Name and designation are required' });
    }

    const [result] = await db.query(
      `INSERT INTO administrative_team (name, designation, department, photo_url, responsibilities, display_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, designation, department, photo_url, responsibilities, display_order || 0]
    );

    const [newTeamMember] = await db.query('SELECT * FROM administrative_team WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newTeamMember[0] });
  } catch (error) {
    console.error('Error creating team member:', error);
    res.status(500).json({ success: false, message: 'Failed to create team member', error: error.message });
  }
});

// Update team member
router.put('/team/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, designation, department, photo_url, responsibilities, display_order } = req.body;

    await db.query(
      `UPDATE administrative_team
       SET name = ?, designation = ?, department = ?, photo_url = ?, responsibilities = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, designation, department, photo_url, responsibilities, display_order, id]
    );

    const [updated] = await db.query('SELECT * FROM administrative_team WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({ success: false, message: 'Failed to update team member', error: error.message });
  }
});

// Delete team member
router.delete('/team/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM administrative_team WHERE id = ?', [id]);
    res.json({ success: true, message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ success: false, message: 'Failed to delete team member', error: error.message });
  }
});

// ============================================================================
// DEPARTMENTS ROUTES (Using existing departments table)
// ============================================================================

// Get all departments with courses
router.get('/departments', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        d.id,
        d.department_name,
        d.department_code,
        d.description,
        d.head_of_department,
        d.faculty_strength,
        d.display_order,
        COUNT(c.id) as total_courses,
        STRING_AGG(c.course_name, ', ') as programs
      FROM departments d
      LEFT JOIN courses c ON d.id = c.department_id
      WHERE d.is_active = 1
      GROUP BY d.id
      ORDER BY d.display_order ASC, d.id ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch departments', error: error.message });
  }
});

// Get single department
router.get('/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM departments WHERE id = ? AND is_active = 1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch department', error: error.message });
  }
});

// Create department
router.post('/departments', async (req, res) => {
  try {
    const { department_name, department_code, head_of_department, faculty_strength, programs, description, display_order } = req.body;

    const [result] = await db.query(
      `INSERT INTO departments (department_name, department_code, head_of_department, faculty_strength, description, display_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [department_name, department_code || null, head_of_department || null, faculty_strength || null, description || null, display_order || 0]
    );

    const [newDept] = await db.query('SELECT * FROM departments WHERE id = ?', [result.insertId]);
    res.json({ success: true, data: newDept[0], message: 'Department created successfully' });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ success: false, message: 'Failed to create department', error: error.message });
  }
});

// Update department
router.put('/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { department_name, department_code, head_of_department, faculty_strength, programs, description, display_order } = req.body;

    await db.query(
      `UPDATE departments
       SET department_name = ?, department_code = ?, head_of_department = ?, faculty_strength = ?, description = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [department_name, department_code || null, head_of_department || null, faculty_strength || null, description || null, display_order || 0, id]
    );

    const [updated] = await db.query('SELECT * FROM departments WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0], message: 'Department updated successfully' });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ success: false, message: 'Failed to update department', error: error.message });
  }
});

// Delete department (soft delete)
router.delete('/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE departments SET is_active = 0 WHERE id = ?', [id]);
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ success: false, message: 'Failed to delete department', error: error.message });
  }
});

// ============================================================================
// ADMINISTRATIVE OFFICES ROUTES
// ============================================================================

// Get all offices
router.get('/offices', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM administrative_offices ORDER BY display_order ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching offices:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch offices', error: error.message });
  }
});

// Get single office
router.get('/offices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM administrative_offices WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Office not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching office:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch office', error: error.message });
  }
});

// Create office
router.post('/offices', async (req, res) => {
  try {
    const { office_name, location, floor, building, display_order } = req.body;

    if (!office_name) {
      return res.status(400).json({ success: false, message: 'Office name is required' });
    }

    const [result] = await db.query(
      `INSERT INTO administrative_offices (office_name, location, floor, building, display_order)
       VALUES (?, ?, ?, ?, ?)`,
      [office_name, location, floor, building, display_order || 0]
    );

    const [newOffice] = await db.query('SELECT * FROM administrative_offices WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newOffice[0] });
  } catch (error) {
    console.error('Error creating office:', error);
    res.status(500).json({ success: false, message: 'Failed to create office', error: error.message });
  }
});

// Update office
router.put('/offices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { office_name, location, floor, building, display_order } = req.body;

    await db.query(
      `UPDATE administrative_offices
       SET office_name = ?, location = ?, floor = ?, building = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [office_name, location, floor, building, display_order, id]
    );

    const [updated] = await db.query('SELECT * FROM administrative_offices WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Error updating office:', error);
    res.status(500).json({ success: false, message: 'Failed to update office', error: error.message });
  }
});

// Delete office
router.delete('/offices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM administrative_offices WHERE id = ?', [id]);
    res.json({ success: true, message: 'Office deleted successfully' });
  } catch (error) {
    console.error('Error deleting office:', error);
    res.status(500).json({ success: false, message: 'Failed to delete office', error: error.message });
  }
});

// ============================================================================
// CONTACTS ROUTES
// ============================================================================

// Get all contacts
router.get('/contacts', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM administration_contacts ORDER BY display_order ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contacts', error: error.message });
  }
});

// Get single contact
router.get('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM administration_contacts WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contact', error: error.message });
  }
});

// Create contact
router.post('/contacts', async (req, res) => {
  try {
    const { contact_type, contact_person, email, phone, display_order } = req.body;

    if (!contact_type || !email) {
      return res.status(400).json({ success: false, message: 'Contact type and email are required' });
    }

    const [result] = await db.query(
      `INSERT INTO administration_contacts (contact_type, contact_person, email, phone, display_order)
       VALUES (?, ?, ?, ?, ?)`,
      [contact_type, contact_person, email, phone, display_order || 0]
    );

    const [newContact] = await db.query('SELECT * FROM administration_contacts WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newContact[0] });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ success: false, message: 'Failed to create contact', error: error.message });
  }
});

// Update contact
router.put('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { contact_type, contact_person, email, phone, display_order } = req.body;

    await db.query(
      `UPDATE administration_contacts
       SET contact_type = ?, contact_person = ?, email = ?, phone = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [contact_type, contact_person, email, phone, display_order, id]
    );

    const [updated] = await db.query('SELECT * FROM administration_contacts WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ success: false, message: 'Failed to update contact', error: error.message });
  }
});

// Delete contact
router.delete('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM administration_contacts WHERE id = ?', [id]);
    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ success: false, message: 'Failed to delete contact', error: error.message });
  }
});

// ============================================================================
// COMPLETE PAGE DATA ROUTE
// ============================================================================

// Get all administration page data in one call
router.get('/complete', async (req, res) => {
  try {
    // Get header
    const [header] = await db.query('SELECT * FROM administration_header LIMIT 1');

    // Get director
    const [director] = await db.query('SELECT * FROM director_info LIMIT 1');

    // Get team
    const [team] = await db.query('SELECT * FROM administrative_team ORDER BY display_order ASC');

    // Get departments
    const [departments] = await db.query(`
      SELECT
        d.id,
        d.department_name,
        d.department_code,
        d.description,
        d.head_of_department,
        d.faculty_strength,
        d.display_order,
        COUNT(c.id) as total_courses,
        STRING_AGG(c.course_name, ', ') as programs
      FROM departments d
      LEFT JOIN courses c ON d.id = c.department_id
      WHERE d.is_active = 1
      GROUP BY d.id
      ORDER BY d.display_order ASC, d.id ASC
    `);

    // Get offices
    const [offices] = await db.query('SELECT * FROM administrative_offices ORDER BY display_order ASC');

    // Get contacts
    const [contacts] = await db.query('SELECT * FROM administration_contacts ORDER BY display_order ASC');

    res.json({
      header: header[0] || null,
      director: director[0] || null,
      team: team,
      departments: departments,
      offices: offices,
      contacts: contacts
    });
  } catch (error) {
    console.error('Error fetching complete page data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch page data', error: error.message });
  }
});

module.exports = router;
