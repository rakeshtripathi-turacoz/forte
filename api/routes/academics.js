const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/academics/departments - Get all departments
router.get('/departments', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM departments WHERE is_active = TRUE ORDER BY department_name'
    );
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching departments',
      error: error.message
    });
  }
});

// POST /api/academics/departments - Add department
router.post('/departments', async (req, res) => {
  try {
    const { department_name, department_code, description, head_of_department } = req.body;

    const [result] = await db.query(
      'INSERT INTO departments (department_name, department_code, description, head_of_department) VALUES (?, ?, ?, ?)',
      [department_name, department_code, description, head_of_department]
    );

    res.json({
      success: true,
      message: 'Department added successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error adding department:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding department',
      error: error.message
    });
  }
});

// PUT /api/academics/departments/:id - Update department
router.put('/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { department_name, department_code, description, head_of_department, is_active } = req.body;

    await db.query(
      'UPDATE departments SET department_name = ?, department_code = ?, description = ?, head_of_department = ?, is_active = ? WHERE id = ?',
      [department_name, department_code, description, head_of_department, is_active !== undefined ? is_active : true, id]
    );

    res.json({
      success: true,
      message: 'Department updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating department'
    });
  }
});

// DELETE /api/academics/departments/:id - Delete department
router.delete('/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM departments WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting department'
    });
  }
});

// GET /api/academics/courses - Get all courses
router.get('/courses', async (req, res) => {
  try {
    const { department_id } = req.query;

    let query = `
      SELECT c.*, d.department_name, d.department_code
      FROM courses c
      LEFT JOIN departments d ON c.department_id = d.id
      WHERE c.is_active = TRUE
    `;
    const params = [];

    if (department_id) {
      query += ' AND c.department_id = ?';
      params.push(department_id);
    }

    query += ' ORDER BY c.course_name';

    const [rows] = await db.query(query, params);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
});

// GET /api/academics/courses/:id - Get single course
router.get('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT c.*, d.department_name, d.department_code
       FROM courses c
       LEFT JOIN departments d ON c.department_id = d.id
       WHERE c.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course'
    });
  }
});

// POST /api/academics/courses - Add course
router.post('/courses', async (req, res) => {
  try {
    const {
      course_name,
      course_code,
      department_id,
      duration_years,
      total_seats,
      eligibility,
      fee_per_year,
      description
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO courses
       (course_name, course_code, department_id, duration_years, total_seats, eligibility, fee_per_year, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [course_name, course_code, department_id, duration_years, total_seats, eligibility, fee_per_year, description]
    );

    res.json({
      success: true,
      message: 'Course added successfully',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding course'
    });
  }
});

// PUT /api/academics/courses/:id - Update course
router.put('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      course_name,
      course_code,
      department_id,
      duration_years,
      total_seats,
      eligibility,
      fee_per_year,
      description,
      is_active
    } = req.body;

    await db.query(
      `UPDATE courses SET
        course_name = ?,
        course_code = ?,
        department_id = ?,
        duration_years = ?,
        total_seats = ?,
        eligibility = ?,
        fee_per_year = ?,
        description = ?,
        is_active = ?
      WHERE id = ?`,
      [course_name, course_code, department_id, duration_years, total_seats, eligibility, fee_per_year, description, is_active !== undefined ? is_active : true, id]
    );

    res.json({
      success: true,
      message: 'Course updated successfully'
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message
    });
  }
});

// DELETE /api/academics/courses/:id - Delete course
router.delete('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM courses WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting course'
    });
  }
});


// ============================================
// ANTI-RAGGING POLICY ROUTES
// ============================================

// GET /api/academics/anti-ragging - Get anti-ragging policy
router.get('/anti-ragging', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM anti_ragging_policy WHERE is_active = TRUE LIMIT 1'
    );
    res.json({
      success: true,
      data: rows[0] || null
    });
  } catch (error) {
    console.error('Error fetching anti-ragging policy:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching anti-ragging policy',
      error: error.message
    });
  }
});

// PUT /api/academics/anti-ragging - Update anti-ragging policy
router.put('/anti-ragging', async (req, res) => {
  try {
    const { policy_content, acts_list, helpline_number, helpline_email } = req.body;

    // Check if policy exists
    const [existing] = await db.query('SELECT id FROM anti_ragging_policy LIMIT 1');

    if (existing.length > 0) {
      // Update existing
      await db.query(
        `UPDATE anti_ragging_policy SET
          policy_content = ?,
          acts_list = ?,
          helpline_number = ?,
          helpline_email = ?,
          updated_at = NOW()
        WHERE id = ?`,
        [policy_content, JSON.stringify(acts_list), helpline_number, helpline_email, existing[0].id]
      );
    } else {
      // Insert new
      await db.query(
        'INSERT INTO anti_ragging_policy (policy_content, acts_list, helpline_number, helpline_email) VALUES (?, ?, ?, ?)',
        [policy_content, JSON.stringify(acts_list), helpline_number, helpline_email]
      );
    }

    res.json({
      success: true,
      message: 'Anti-ragging policy updated successfully'
    });
  } catch (error) {
    console.error('Error updating anti-ragging policy:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating anti-ragging policy',
      error: error.message
    });
  }
});

// ============================================
// STUDENT GRIEVANCES ROUTES
// ============================================

// GET /api/academics/grievances - Get all grievances
router.get('/grievances', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT g.*, d.department_name
      FROM student_grievances g
      LEFT JOIN departments d ON g.department_id = d.id
    `;
    const params = [];

    if (status) {
      query += ' WHERE g.status = ?';
      params.push(status);
    }

    query += ' ORDER BY g.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.query(query, params);

    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM student_grievances' + (status ? ' WHERE status = ?' : ''),
      status ? [status] : []
    );

    res.json({
      success: true,
      data: rows,
      total: countResult[0].total
    });
  } catch (error) {
    console.error('Error fetching grievances:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grievances',
      error: error.message
    });
  }
});

// POST /api/academics/grievances - Submit new grievance
router.post('/grievances', async (req, res) => {
  try {
    const {
      student_name,
      student_id,
      email,
      phone,
      department_id,
      grievance_description
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO student_grievances
       (student_name, student_id, email, phone, department_id, grievance_description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [student_name, student_id, email, phone, department_id, grievance_description]
    );

    res.json({
      success: true,
      message: 'Grievance submitted successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error submitting grievance:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting grievance',
      error: error.message
    });
  }
});

// PUT /api/academics/grievances/:id - Update grievance status
router.put('/grievances/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, admin_notes } = req.body;

    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
      if (status === 'resolved' || status === 'closed') {
        updates.push('resolved_at = NOW()');
      }
    }
    if (priority) {
      updates.push('priority = ?');
      params.push(priority);
    }
    if (admin_notes !== undefined) {
      updates.push('admin_notes = ?');
      params.push(admin_notes);
    }

    params.push(id);

    await db.query(
      `UPDATE student_grievances SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      params
    );

    res.json({
      success: true,
      message: 'Grievance updated successfully'
    });
  } catch (error) {
    console.error('Error updating grievance:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating grievance',
      error: error.message
    });
  }
});

// DELETE /api/academics/grievances/:id - Delete grievance
router.delete('/grievances/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM student_grievances WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Grievance deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting grievance:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting grievance',
      error: error.message
    });
  }
});

// ============================================
// FACULTY ROUTES
// ============================================

// GET /api/academics/faculty - Get all faculty
router.get('/faculty', async (req, res) => {
  try {
    const { department_id } = req.query;

    let query = `
      SELECT f.*, d.department_name, d.department_code
      FROM faculty f
      LEFT JOIN departments d ON f.department_id = d.id
      WHERE f.is_active = TRUE
    `;
    const params = [];

    if (department_id) {
      query += ' AND f.department_id = ?';
      params.push(department_id);
    }

    query += ' ORDER BY f.display_order, f.full_name';

    const [rows] = await db.query(query, params);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching faculty',
      error: error.message
    });
  }
});

// GET /api/academics/faculty/:id - Get single faculty member
router.get('/faculty/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT f.*, d.department_name, d.department_code
       FROM faculty f
       LEFT JOIN departments d ON f.department_id = d.id
       WHERE f.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching faculty member:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching faculty member',
      error: error.message
    });
  }
});

// POST /api/academics/faculty - Add faculty member
router.post('/faculty', async (req, res) => {
  try {
    const {
      full_name,
      designation,
      department_id,
      qualification,
      experience_years,
      specialization,
      email,
      phone,
      photo_url,
      bio,
      display_order
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO faculty
       (full_name, designation, department_id, qualification, experience_years, specialization, email, phone, photo_url, bio, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [full_name, designation, department_id, qualification, experience_years, specialization, email, phone, photo_url, bio, display_order || 0]
    );

    res.json({
      success: true,
      message: 'Faculty member added successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error adding faculty member:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding faculty member',
      error: error.message
    });
  }
});

// PUT /api/academics/faculty/:id - Update faculty member
router.put('/faculty/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      full_name,
      designation,
      department_id,
      qualification,
      experience_years,
      specialization,
      email,
      phone,
      photo_url,
      bio,
      display_order,
      is_active
    } = req.body;

    await db.query(
      `UPDATE faculty SET
        full_name = ?,
        designation = ?,
        department_id = ?,
        qualification = ?,
        experience_years = ?,
        specialization = ?,
        email = ?,
        phone = ?,
        photo_url = ?,
        bio = ?,
        display_order = ?,
        is_active = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [full_name, designation, department_id, qualification, experience_years, specialization, email, phone, photo_url, bio, display_order || 0, is_active !== undefined ? is_active : true, id]
    );

    res.json({
      success: true,
      message: 'Faculty member updated successfully'
    });
  } catch (error) {
    console.error('Error updating faculty member:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating faculty member',
      error: error.message
    });
  }
});

// DELETE /api/academics/faculty/:id - Delete faculty member
router.delete('/faculty/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM faculty WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Faculty member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting faculty member:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting faculty member',
      error: error.message
    });
  }
});

module.exports = router;
