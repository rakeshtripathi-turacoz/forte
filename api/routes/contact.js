const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { sendContactFormEmail, notifyAdminNewContact } = require('../utils/emailService');

// POST /api/contact/submit - Submit contact form
router.post('/submit', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and message are required'
      });
    }

    const ip_address = req.ip || req.connection.remoteAddress;

    const [result] = await db.query(
      'INSERT INTO contact_submissions (name, email, phone, subject, message, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone, subject, message, ip_address]
    );

    const submission_id = result.insertId;

    console.log('✅ Contact form saved to contact_submissions table, ID:', submission_id);

    // Send confirmation email to user
    const contactData = {
      name,
      email,
      phone,
      subject,
      message,
      submission_id
    };

    console.log('📧 Now logging to email_logs table...');

    // Send emails asynchronously (don't block the response)
    // If email fails, we still save the data and respond successfully
    Promise.all([
      sendContactFormEmail(contactData).catch(err => {
        console.error('❌ Error in sendContactFormEmail:', err);
        return { success: false, error: err.message };
      }),
      notifyAdminNewContact(contactData).catch(err => {
        console.error('❌ Error in notifyAdminNewContact:', err);
        return { success: false, error: err.message };
      })
    ]).then(results => {
      console.log('📊 Email logging results:', results);
    }).catch(err => {
      console.error('❌ Promise.all error:', err);
    });

    res.json({
      success: true,
      message: 'Message sent successfully',
      submission_id
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
});

// GET /api/contact/submissions - Get all contact submissions (Admin only)
router.get('/submissions', async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;

    let query = 'SELECT * FROM contact_submissions';
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
        ? 'SELECT COUNT(*) as total FROM contact_submissions WHERE status = ?'
        : 'SELECT COUNT(*) as total FROM contact_submissions',
      status ? [status] : []
    );

    res.json({
      success: true,
      data,
      total: countResult[0].total,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(countResult[0].total / limit)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions'
    });
  }
});

// PUT /api/contact/submissions/:id/status - Update submission status
router.put('/submissions/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.query(
      'UPDATE contact_submissions SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({
      success: true,
      message: 'Status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating status'
    });
  }
});

// DELETE /api/contact/submissions/:id - Delete submission
router.delete('/submissions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM contact_submissions WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting submission'
    });
  }
});

module.exports = router;
