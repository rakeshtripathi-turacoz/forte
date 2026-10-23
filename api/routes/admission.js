const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { sendAdmissionEnquiryEmail, notifyAdminNewEnquiry } = require('../utils/emailService');

// POST /api/admission/enquiry - Submit admission enquiry
router.post('/enquiry', async (req, res) => {
  try {
    const {
      full_name,
      father_name,
      date_of_birth,
      category,
      email,
      mobile_number,
      address,
      program_interested
    } = req.body;

    // Validation
    if (!full_name || !father_name || !date_of_birth || !category || !email || !mobile_number || !address || !program_interested) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const [result] = await db.query(
      `INSERT INTO admission_enquiries
       (full_name, father_name, date_of_birth, category, email, mobile_number, address, program_interested)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [full_name, father_name, date_of_birth, category, email, mobile_number, address, program_interested]
    );

    const enquiry_id = result.insertId;

    console.log('✅ Admission enquiry saved to admission_enquiries table, ID:', enquiry_id);

    // Prepare enquiry data for emails
    const enquiryData = {
      full_name,
      father_name,
      date_of_birth,
      category,
      email,
      mobile_number,
      address,
      program_interested,
      enquiry_id
    };

    console.log('📧 Now logging to email_logs table...');

    // Send emails asynchronously (don't block the response)
    // If email fails, we still save the data and respond successfully
    Promise.all([
      sendAdmissionEnquiryEmail(enquiryData).catch(err => {
        console.error('❌ Error in sendAdmissionEnquiryEmail:', err);
        return { success: false, error: err.message };
      }),
      notifyAdminNewEnquiry(enquiryData).catch(err => {
        console.error('❌ Error in notifyAdminNewEnquiry:', err);
        return { success: false, error: err.message };
      })
    ]).then(results => {
      console.log('📊 Email logging results:', results);
    }).catch(err => {
      console.error('❌ Promise.all error:', err);
    });

    res.json({
      success: true,
      message: 'Enquiry submitted successfully',
      enquiry_id
    });
  } catch (error) {
    console.error('Error submitting enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting enquiry'
    });
  }
});

// GET /api/admission/enquiries - Get all enquiries (Admin only)
router.get('/enquiries', async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;

    let query = 'SELECT * FROM admission_enquiries';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [data] = await db.query(query, params);

    const [countResult] = await db.query(
      status
        ? 'SELECT COUNT(*) as total FROM admission_enquiries WHERE status = ?'
        : 'SELECT COUNT(*) as total FROM admission_enquiries',
      status ? [status] : []
    );
    const total = countResult[0].total;

    res.json({
      success: true,
      data,
      total,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enquiries'
    });
  }
});

// GET /api/admission/enquiries/:id - Get single enquiry
router.get('/enquiries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM admission_enquiries WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching enquiry'
    });
  }
});

// PUT /api/admission/enquiries/:id/status - Update enquiry status
router.put('/enquiries/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    await db.query(
      'UPDATE admission_enquiries SET status = ?, notes = ? WHERE id = ?',
      [status, notes || null, id]
    );

    res.json({
      success: true,
      message: 'Enquiry status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating enquiry status'
    });
  }
});

// DELETE /api/admission/enquiries/:id - Delete enquiry
router.delete('/enquiries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM admission_enquiries WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Enquiry deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting enquiry'
    });
  }
});

// =============================================
// ADMISSION PAGE CONTENT ROUTES
// =============================================

// GET /api/admission/header - Get admission page header
router.get('/header', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM admission_page_header WHERE is_active = TRUE LIMIT 1'
    );
    res.json({
      success: true,
      data: rows[0] || null
    });
  } catch (error) {
    console.error('Error fetching admission header:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admission header'
    });
  }
});

// GET /api/admission/programs - Get all programs (optionally filter by level)
router.get('/programs', async (req, res) => {
  try {
    const { level } = req.query; // UG or PG

    let query = 'SELECT * FROM admission_programs WHERE is_active = TRUE';
    const params = [];

    if (level) {
      query += ' AND program_level = ?';
      params.push(level);
    }

    query += ' ORDER BY display_order ASC';

    const [rows] = await db.query(query, params);
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching programs'
    });
  }
});

// GET /api/admission/process-steps - Get admission process steps
router.get('/process-steps', async (req, res) => {
  try {
    const { level } = req.query; // UG, PG, or All

    let query = 'SELECT * FROM admission_process_steps WHERE is_active = TRUE';
    const params = [];

    if (level) {
      query += " AND (program_level = ? OR program_level = 'All')";
      params.push(level);
    }

    query += ' ORDER BY step_number ASC';

    const [rows] = await db.query(query, params);
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching process steps:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching process steps'
    });
  }
});

// GET /api/admission/payment-info - Get payment bank details
router.get('/payment-info', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM admission_payment_info WHERE is_active = TRUE LIMIT 1'
    );
    res.json({
      success: true,
      data: rows[0] || null
    });
  } catch (error) {
    console.error('Error fetching payment info:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment info'
    });
  }
});

// GET /api/admission/payment-options - Get payment options
router.get('/payment-options', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM admission_payment_options WHERE is_active = TRUE ORDER BY display_order ASC'
    );
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching payment options:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment options'
    });
  }
});

// GET /api/admission/payment-guidelines - Get payment guidelines
router.get('/payment-guidelines', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM admission_payment_guidelines WHERE is_active = TRUE ORDER BY display_order ASC'
    );
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching payment guidelines:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment guidelines'
    });
  }
});

// GET /api/admission/documents - Get required documents
router.get('/documents', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM admission_required_documents WHERE is_active = TRUE ORDER BY display_order ASC'
    );
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching documents'
    });
  }
});

// GET /api/admission/document-guidelines - Get document guidelines
router.get('/document-guidelines', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM admission_document_guidelines WHERE is_active = TRUE ORDER BY display_order ASC'
    );
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching document guidelines:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching document guidelines'
    });
  }
});

// GET /api/admission/contacts - Get admission contacts
router.get('/contacts', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM admission_contacts WHERE is_active = TRUE ORDER BY display_order ASC'
    );
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contacts'
    });
  }
});

// GET /api/admission/affiliations - Get affiliations
router.get('/affiliations', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM admission_affiliations WHERE is_active = TRUE ORDER BY display_order ASC'
    );
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching affiliations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching affiliations'
    });
  }
});

// =============================================
// PROCESS STEPS CRUD OPERATIONS
// =============================================

// POST /api/admission/process-steps - Create new process step
router.post('/process-steps', async (req, res) => {
  try {
    const {
      program_level,
      step_number,
      step_title,
      step_description
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO admission_process_steps
       (program_level, step_number, step_title, step_description)
       VALUES (?, ?, ?, ?)`,
      [program_level, step_number, step_title, step_description]
    );

    res.json({
      success: true,
      message: 'Process step created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating process step:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating process step'
    });
  }
});

// PUT /api/admission/process-steps/:id - Update process step
router.put('/process-steps/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      program_level,
      step_number,
      step_title,
      step_description,
      is_active
    } = req.body;

    await db.query(
      `UPDATE admission_process_steps
       SET program_level = ?, step_number = ?, step_title = ?, step_description = ?, is_active = ?
       WHERE id = ?`,
      [program_level, step_number, step_title, step_description, is_active, id]
    );

    res.json({
      success: true,
      message: 'Process step updated successfully'
    });
  } catch (error) {
    console.error('Error updating process step:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating process step'
    });
  }
});

// DELETE /api/admission/process-steps/:id - Delete process step
router.delete('/process-steps/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM admission_process_steps WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Process step deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting process step:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting process step'
    });
  }
});

// =============================================
// PAYMENT INFO CRUD OPERATIONS
// =============================================

// PUT /api/admission/payment-info/:id - Update payment info
router.put('/payment-info/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      account_name,
      bank_name,
      account_number,
      ifsc_code,
      branch_name,
      branch_address,
      upi_id,
      payment_gateway_url,
      qr_code_url
    } = req.body;

    await db.query(
      `UPDATE admission_payment_info
       SET account_name = ?, bank_name = ?, account_number = ?, ifsc_code = ?,
           branch_name = ?, branch_address = ?, upi_id = ?, payment_gateway_url = ?, qr_code_url = ?
       WHERE id = ?`,
      [account_name, bank_name, account_number, ifsc_code, branch_name, branch_address, upi_id, payment_gateway_url, qr_code_url, id]
    );

    res.json({
      success: true,
      message: 'Payment info updated successfully'
    });
  } catch (error) {
    console.error('Error updating payment info:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment info'
    });
  }
});

// =============================================
// PAYMENT OPTIONS CRUD OPERATIONS
// =============================================

// POST /api/admission/payment-options - Create new payment option
router.post('/payment-options', async (req, res) => {
  try {
    const {
      option_type,
      option_title,
      option_description,
      display_order
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO admission_payment_options
       (option_type, option_title, option_description, display_order)
       VALUES (?, ?, ?, ?)`,
      [option_type, option_title, option_description, display_order || 0]
    );

    res.json({
      success: true,
      message: 'Payment option created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating payment option:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment option'
    });
  }
});

// PUT /api/admission/payment-options/:id - Update payment option
router.put('/payment-options/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      option_type,
      option_title,
      option_description,
      display_order,
      is_active
    } = req.body;

    await db.query(
      `UPDATE admission_payment_options
       SET option_type = ?, option_title = ?, option_description = ?, display_order = ?, is_active = ?
       WHERE id = ?`,
      [option_type, option_title, option_description, display_order, is_active, id]
    );

    res.json({
      success: true,
      message: 'Payment option updated successfully'
    });
  } catch (error) {
    console.error('Error updating payment option:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment option'
    });
  }
});

// DELETE /api/admission/payment-options/:id - Delete payment option
router.delete('/payment-options/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM admission_payment_options WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Payment option deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting payment option:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting payment option'
    });
  }
});

// =============================================
// PAYMENT GUIDELINES CRUD OPERATIONS
// =============================================

// POST /api/admission/payment-guidelines - Create new payment guideline
router.post('/payment-guidelines', async (req, res) => {
  try {
    const {
      guideline_type,
      guideline_text,
      display_order
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO admission_payment_guidelines
       (guideline_type, guideline_text, display_order)
       VALUES (?, ?, ?)`,
      [guideline_type, guideline_text, display_order || 0]
    );

    res.json({
      success: true,
      message: 'Payment guideline created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating payment guideline:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment guideline'
    });
  }
});

// PUT /api/admission/payment-guidelines/:id - Update payment guideline
router.put('/payment-guidelines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      guideline_type,
      guideline_text,
      display_order,
      is_active
    } = req.body;

    await db.query(
      `UPDATE admission_payment_guidelines
       SET guideline_type = ?, guideline_text = ?, display_order = ?, is_active = ?
       WHERE id = ?`,
      [guideline_type, guideline_text, display_order, is_active, id]
    );

    res.json({
      success: true,
      message: 'Payment guideline updated successfully'
    });
  } catch (error) {
    console.error('Error updating payment guideline:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment guideline'
    });
  }
});

// DELETE /api/admission/payment-guidelines/:id - Delete payment guideline
router.delete('/payment-guidelines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM admission_payment_guidelines WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Payment guideline deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting payment guideline:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting payment guideline'
    });
  }
});

// =============================================
// DOCUMENT GUIDELINES CRUD OPERATIONS
// =============================================

// POST /api/admission/document-guidelines - Create new document guideline
router.post('/document-guidelines', async (req, res) => {
  try {
    const {
      guideline_text,
      display_order
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO admission_document_guidelines
       (guideline_text, display_order)
       VALUES (?, ?)`,
      [guideline_text, display_order || 0]
    );

    res.json({
      success: true,
      message: 'Document guideline created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating document guideline:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating document guideline'
    });
  }
});

// PUT /api/admission/document-guidelines/:id - Update document guideline
router.put('/document-guidelines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      guideline_text,
      display_order,
      is_active
    } = req.body;

    await db.query(
      `UPDATE admission_document_guidelines
       SET guideline_text = ?, display_order = ?, is_active = ?
       WHERE id = ?`,
      [guideline_text, display_order, is_active, id]
    );

    res.json({
      success: true,
      message: 'Document guideline updated successfully'
    });
  } catch (error) {
    console.error('Error updating document guideline:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating document guideline'
    });
  }
});

// DELETE /api/admission/document-guidelines/:id - Delete document guideline
router.delete('/document-guidelines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM admission_document_guidelines WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Document guideline deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document guideline:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting document guideline'
    });
  }
});

// =============================================
// PROGRAMS CRUD OPERATIONS
// =============================================

// POST /api/admission/programs - Create new program
router.post('/programs', async (req, res) => {
  try {
    const {
      program_name,
      program_code,
      program_level,
      affiliation,
      affiliation_type,
      eligibility,
      duration,
      total_seats,
      fee_per_year,
      description,
      display_order
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO admission_programs
       (program_name, program_code, program_level, affiliation, affiliation_type, eligibility, duration, total_seats, fee_per_year, description, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [program_name, program_code, program_level, affiliation, affiliation_type, eligibility, duration, total_seats, fee_per_year, description, display_order || 0]
    );

    res.json({
      success: true,
      message: 'Program created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating program:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating program'
    });
  }
});

// PUT /api/admission/programs/:id - Update program
router.put('/programs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      program_name,
      program_code,
      program_level,
      affiliation,
      affiliation_type,
      eligibility,
      duration,
      total_seats,
      fee_per_year,
      description,
      display_order,
      is_active
    } = req.body;

    await db.query(
      `UPDATE admission_programs
       SET program_name = ?, program_code = ?, program_level = ?, affiliation = ?, affiliation_type = ?,
           eligibility = ?, duration = ?, total_seats = ?, fee_per_year = ?, description = ?,
           display_order = ?, is_active = ?
       WHERE id = ?`,
      [program_name, program_code, program_level, affiliation, affiliation_type, eligibility, duration, total_seats, fee_per_year, description, display_order, is_active, id]
    );

    res.json({
      success: true,
      message: 'Program updated successfully'
    });
  } catch (error) {
    console.error('Error updating program:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating program'
    });
  }
});

// DELETE /api/admission/programs/:id - Delete program
router.delete('/programs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM admission_programs WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Program deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting program:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting program'
    });
  }
});

// =============================================
// DOCUMENTS CRUD OPERATIONS
// =============================================

// POST /api/admission/documents - Create new document
router.post('/documents', async (req, res) => {
  try {
    const {
      document_name,
      document_description,
      is_mandatory,
      applicable_for,
      program_specific,
      display_order
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO admission_required_documents
       (document_name, document_description, is_mandatory, applicable_for, program_specific, display_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [document_name, document_description, is_mandatory, applicable_for, program_specific, display_order || 0]
    );

    res.json({
      success: true,
      message: 'Document created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating document'
    });
  }
});

// PUT /api/admission/documents/:id - Update document
router.put('/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      document_name,
      document_description,
      is_mandatory,
      applicable_for,
      program_specific,
      display_order,
      is_active
    } = req.body;

    await db.query(
      `UPDATE admission_required_documents
       SET document_name = ?, document_description = ?, is_mandatory = ?, applicable_for = ?,
           program_specific = ?, display_order = ?, is_active = ?
       WHERE id = ?`,
      [document_name, document_description, is_mandatory, applicable_for, program_specific, display_order, is_active, id]
    );

    res.json({
      success: true,
      message: 'Document updated successfully'
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating document'
    });
  }
});

// DELETE /api/admission/documents/:id - Delete document
router.delete('/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM admission_required_documents WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting document'
    });
  }
});

// =============================================
// CONTACTS CRUD OPERATIONS
// =============================================

// POST /api/admission/contacts - Create new contact
router.post('/contacts', async (req, res) => {
  try {
    const {
      contact_type,
      contact_title,
      contact_value,
      contact_description,
      available_hours,
      is_toll_free,
      display_order
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO admission_contacts
       (contact_type, contact_title, contact_value, contact_description, available_hours, is_toll_free, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [contact_type, contact_title, contact_value, contact_description, available_hours, is_toll_free, display_order || 0]
    );

    res.json({
      success: true,
      message: 'Contact created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating contact'
    });
  }
});

// PUT /api/admission/contacts/:id - Update contact
router.put('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      contact_type,
      contact_title,
      contact_value,
      contact_description,
      available_hours,
      is_toll_free,
      display_order,
      is_active
    } = req.body;

    await db.query(
      `UPDATE admission_contacts
       SET contact_type = ?, contact_title = ?, contact_value = ?, contact_description = ?,
           available_hours = ?, is_toll_free = ?, display_order = ?, is_active = ?
       WHERE id = ?`,
      [contact_type, contact_title, contact_value, contact_description, available_hours, is_toll_free, display_order, is_active, id]
    );

    res.json({
      success: true,
      message: 'Contact updated successfully'
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating contact'
    });
  }
});

// DELETE /api/admission/contacts/:id - Delete contact
router.delete('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM admission_contacts WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting contact'
    });
  }
});

module.exports = router;
