const express = require('express');
const router = express.Router();
const db = require('../config/database');

// ========================================
// COMPLETE PAGE DATA
// ========================================

// Get all anti-ragging page data using stored procedure
router.get('/complete', async (req, res) => {
  try {
    const [results] = await db.query('CALL GetAntiRaggingPageData()');

    res.json({
      success: true,
      data: {
        header: results[0][0] || null,
        antiRaggingCommittee: results[1] || [],
        grievanceCommittee: results[2] || [],
        emergencyContacts: results[3] || [],
        documents: results[4] || [],
        statistics: results[5][0] || null
      }
    });
  } catch (error) {
    console.error('Error fetching complete page data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch page data',
      error: error.message
    });
  }
});

// ========================================
// PAGE HEADER
// ========================================

// Get page header
router.get('/header', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM anti_ragging_page_header WHERE id = 1'
    );

    res.json({
      success: true,
      data: rows[0] || null
    });
  } catch (error) {
    console.error('Error fetching header:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch header',
      error: error.message
    });
  }
});

// Update page header
router.put('/header', async (req, res) => {
  try {
    const { title, subtitle, description } = req.body;

    // Check if header exists
    const [existing] = await db.query(
      'SELECT id FROM anti_ragging_page_header WHERE id = 1'
    );

    if (existing.length > 0) {
      // Update existing
      await db.query(
        'UPDATE anti_ragging_page_header SET title = ?, subtitle = ?, description = ? WHERE id = 1',
        [title, subtitle, description]
      );
    } else {
      // Insert new
      await db.query(
        'INSERT INTO anti_ragging_page_header (title, subtitle, description) VALUES (?, ?, ?)',
        [title, subtitle, description]
      );
    }

    res.json({
      success: true,
      message: 'Header updated successfully'
    });
  } catch (error) {
    console.error('Error updating header:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update header',
      error: error.message
    });
  }
});

// ========================================
// ANTI-RAGGING COMMITTEE MEMBERS
// ========================================

// Get all anti-ragging committee members
router.get('/anti-ragging-committee', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM anti_ragging_committee_members WHERE is_active = TRUE ORDER BY display_order'
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching anti-ragging committee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch committee members',
      error: error.message
    });
  }
});

// Get single anti-ragging committee member
router.get('/anti-ragging-committee/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM anti_ragging_committee_members WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch member',
      error: error.message
    });
  }
});

// Add anti-ragging committee member
router.post('/anti-ragging-committee', async (req, res) => {
  try {
    const {
      member_name,
      designation,
      role,
      department,
      phone,
      email,
      photo_url,
      display_order
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO anti_ragging_committee_members
      (member_name, designation, role, department, phone, email, photo_url, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [member_name, designation, role, department, phone, email, photo_url, display_order || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Committee member added successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add member',
      error: error.message
    });
  }
});

// Update anti-ragging committee member
router.put('/anti-ragging-committee/:id', async (req, res) => {
  try {
    const {
      member_name,
      designation,
      role,
      department,
      phone,
      email,
      photo_url,
      display_order
    } = req.body;

    const [result] = await db.query(
      `UPDATE anti_ragging_committee_members
      SET member_name = ?, designation = ?, role = ?, department = ?,
          phone = ?, email = ?, photo_url = ?, display_order = ?
      WHERE id = ?`,
      [member_name, designation, role, department, phone, email, photo_url, display_order, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.json({
      success: true,
      message: 'Committee member updated successfully'
    });
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update member',
      error: error.message
    });
  }
});

// Delete (soft delete) anti-ragging committee member
router.delete('/anti-ragging-committee/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'UPDATE anti_ragging_committee_members SET is_active = FALSE WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.json({
      success: true,
      message: 'Committee member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete member',
      error: error.message
    });
  }
});

// ========================================
// GRIEVANCE COMMITTEE MEMBERS
// ========================================

// Get all grievance committee members
router.get('/grievance-committee', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM grievance_committee_members WHERE is_active = TRUE ORDER BY display_order'
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching grievance committee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch committee members',
      error: error.message
    });
  }
});

// Get single grievance committee member
router.get('/grievance-committee/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM grievance_committee_members WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch member',
      error: error.message
    });
  }
});

// Add grievance committee member
router.post('/grievance-committee', async (req, res) => {
  try {
    const {
      member_name,
      designation,
      role,
      department,
      phone,
      email,
      photo_url,
      display_order
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO grievance_committee_members
      (member_name, designation, role, department, phone, email, photo_url, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [member_name, designation, role, department, phone, email, photo_url, display_order || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Committee member added successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add member',
      error: error.message
    });
  }
});

// Update grievance committee member
router.put('/grievance-committee/:id', async (req, res) => {
  try {
    const {
      member_name,
      designation,
      role,
      department,
      phone,
      email,
      photo_url,
      display_order
    } = req.body;

    const [result] = await db.query(
      `UPDATE grievance_committee_members
      SET member_name = ?, designation = ?, role = ?, department = ?,
          phone = ?, email = ?, photo_url = ?, display_order = ?
      WHERE id = ?`,
      [member_name, designation, role, department, phone, email, photo_url, display_order, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.json({
      success: true,
      message: 'Committee member updated successfully'
    });
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update member',
      error: error.message
    });
  }
});

// Delete (soft delete) grievance committee member
router.delete('/grievance-committee/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'UPDATE grievance_committee_members SET is_active = FALSE WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.json({
      success: true,
      message: 'Committee member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete member',
      error: error.message
    });
  }
});

// ========================================
// EMERGENCY CONTACTS
// ========================================

// Get all emergency contacts
router.get('/emergency-contacts', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM emergency_contacts WHERE is_active = TRUE ORDER BY display_order'
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emergency contacts',
      error: error.message
    });
  }
});

// Add emergency contact
router.post('/emergency-contacts', async (req, res) => {
  try {
    const {
      contact_type,
      contact_name,
      phone,
      email,
      available_hours,
      description,
      is_toll_free,
      display_order
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO emergency_contacts
      (contact_type, contact_name, phone, email, available_hours, description, is_toll_free, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [contact_type, contact_name, phone, email, available_hours, description, is_toll_free || false, display_order || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Emergency contact added successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error adding emergency contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add emergency contact',
      error: error.message
    });
  }
});

// Update emergency contact
router.put('/emergency-contacts/:id', async (req, res) => {
  try {
    const {
      contact_type,
      contact_name,
      phone,
      email,
      available_hours,
      description,
      is_toll_free,
      display_order
    } = req.body;

    const [result] = await db.query(
      `UPDATE emergency_contacts
      SET contact_type = ?, contact_name = ?, phone = ?, email = ?,
          available_hours = ?, description = ?, is_toll_free = ?, display_order = ?
      WHERE id = ?`,
      [contact_type, contact_name, phone, email, available_hours, description, is_toll_free, display_order, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found'
      });
    }

    res.json({
      success: true,
      message: 'Emergency contact updated successfully'
    });
  } catch (error) {
    console.error('Error updating emergency contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update emergency contact',
      error: error.message
    });
  }
});

// Delete emergency contact
router.delete('/emergency-contacts/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'UPDATE emergency_contacts SET is_active = FALSE WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found'
      });
    }

    res.json({
      success: true,
      message: 'Emergency contact deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting emergency contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete emergency contact',
      error: error.message
    });
  }
});

// ========================================
// COMMITTEE DOCUMENTS
// ========================================

// Get all documents
router.get('/documents', async (req, res) => {
  try {
    const { category } = req.query;

    let query = 'SELECT * FROM committee_documents WHERE is_active = TRUE';
    const params = [];

    if (category) {
      query += ' AND (document_category = ? OR document_category = "Both")';
      params.push(category);
    }

    query += ' ORDER BY display_order';

    const [rows] = await db.query(query, params);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
});

// Add document
router.post('/documents', async (req, res) => {
  try {
    const {
      document_title,
      document_type,
      document_category,
      file_url,
      file_size,
      description,
      uploaded_date,
      display_order
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO committee_documents
      (document_title, document_type, document_category, file_url, file_size, description, uploaded_date, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [document_title, document_type, document_category, file_url, file_size, description, uploaded_date, display_order || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Document added successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error adding document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add document',
      error: error.message
    });
  }
});

// Update document
router.put('/documents/:id', async (req, res) => {
  try {
    const {
      document_title,
      document_type,
      document_category,
      file_url,
      file_size,
      description,
      uploaded_date,
      display_order
    } = req.body;

    const [result] = await db.query(
      `UPDATE committee_documents
      SET document_title = ?, document_type = ?, document_category = ?,
          file_url = ?, file_size = ?, description = ?, uploaded_date = ?, display_order = ?
      WHERE id = ?`,
      [document_title, document_type, document_category, file_url, file_size, description, uploaded_date, display_order, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      message: 'Document updated successfully'
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document',
      error: error.message
    });
  }
});

// Delete document
router.delete('/documents/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'UPDATE committee_documents SET is_active = FALSE WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
});

// ========================================
// GRIEVANCE SUBMISSIONS
// ========================================

// Get all grievance submissions (Admin)
router.get('/grievance-submissions', async (req, res) => {
  try {
    const { status, type, priority } = req.query;

    let query = 'SELECT * FROM grievance_submissions WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (type) {
      query += ' AND grievance_type = ?';
      params.push(type);
    }

    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }

    query += ' ORDER BY submitted_date DESC';

    const [rows] = await db.query(query, params);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching grievance submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grievance submissions',
      error: error.message
    });
  }
});

// Submit grievance (Public)
router.post('/grievance-submissions', async (req, res) => {
  try {
    const {
      student_name,
      student_id,
      course,
      year,
      email,
      phone,
      grievance_type,
      subject,
      description,
      evidence_url,
      is_anonymous
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO grievance_submissions
      (student_name, student_id, course, year, email, phone, grievance_type, subject, description, evidence_url, is_anonymous)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_name || 'Anonymous', student_id, course, year, email, phone, grievance_type, subject, description, evidence_url, is_anonymous || false]
    );

    res.status(201).json({
      success: true,
      message: 'Grievance submitted successfully. You will be contacted soon.',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error submitting grievance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit grievance',
      error: error.message
    });
  }
});

// Update grievance submission (Admin)
router.put('/grievance-submissions/:id', async (req, res) => {
  try {
    const {
      status,
      priority,
      assigned_to,
      resolution_notes,
      resolved_date
    } = req.body;

    const [result] = await db.query(
      `UPDATE grievance_submissions
      SET status = ?, priority = ?, assigned_to = ?, resolution_notes = ?, resolved_date = ?
      WHERE id = ?`,
      [status, priority, assigned_to, resolution_notes, resolved_date, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Grievance submission not found'
      });
    }

    res.json({
      success: true,
      message: 'Grievance submission updated successfully'
    });
  } catch (error) {
    console.error('Error updating grievance submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update grievance submission',
      error: error.message
    });
  }
});

// Get grievance statistics
router.get('/statistics', async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT
        COUNT(*) as total_grievances,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved_count,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_count,
        SUM(CASE WHEN status = 'Submitted' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN priority = 'Urgent' THEN 1 ELSE 0 END) as urgent_count
      FROM grievance_submissions
    `);

    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

module.exports = router;
