const express = require('express');
const router = express.Router();
const db = require('../config/database');

// =====================================================
// GET ALL EMAIL LOGS WITH FILTERS & PAGINATION
// =====================================================
router.get('/', async (req, res) => {
  try {
    const {
      status,
      email_type,
      from_date,
      to_date,
      search,
      page = 1,
      limit = 50,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    // Build WHERE conditions
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (email_type) {
      conditions.push('email_type = ?');
      params.push(email_type);
    }

    if (from_date) {
      conditions.push('DATE(created_at) >= ?');
      params.push(from_date);
    }

    if (to_date) {
      conditions.push('DATE(created_at) <= ?');
      params.push(to_date);
    }

    if (search) {
      conditions.push('(to_email LIKE ? OR subject LIKE ? OR to_name LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM email_logs ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Get paginated data
    const offset = (page - 1) * limit;
    const validSortColumns = ['created_at', 'sent_at', 'to_email', 'subject', 'status'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [logs] = await db.query(
      `SELECT
        el.*,
        ss.setting_name as smtp_config_name
      FROM email_logs el
      LEFT JOIN smtp_settings ss ON el.smtp_setting_id = ss.id
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: logs,
      pagination: {
        total: total,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching email logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching email logs',
      error: error.message
    });
  }
});

// =====================================================
// GET EMAIL LOG STATISTICS
// =====================================================
router.get('/statistics', async (req, res) => {
  try {
    const { from_date, to_date } = req.query;

    const conditions = [];
    const params = [];

    if (from_date) {
      conditions.push('DATE(created_at) >= ?');
      params.push(from_date);
    }

    if (to_date) {
      conditions.push('DATE(created_at) <= ?');
      params.push(to_date);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Overall statistics
    const [overallStats] = await db.query(
      `SELECT
        COUNT(*) as total_emails,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent_emails,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_emails,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_emails,
        SUM(CASE WHEN status = 'bounced' THEN 1 ELSE 0 END) as bounced_emails,
        SUM(CASE WHEN status = 'opened' THEN 1 ELSE 0 END) as opened_emails,
        ROUND(
          (SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) / COUNT(*)) * 100,
          2
        ) as delivery_rate
      FROM email_logs
      ${whereClause}`,
      params
    );

    // By email type
    const [byType] = await db.query(
      `SELECT
        email_type,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
      FROM email_logs
      ${whereClause}
      GROUP BY email_type
      ORDER BY total DESC`,
      params
    );

    // By status
    const [byStatus] = await db.query(
      `SELECT
        status,
        COUNT(*) as total
      FROM email_logs
      ${whereClause}
      GROUP BY status`,
      params
    );

    // Daily statistics (last 7 days)
    const [dailyStats] = await db.query(
      `SELECT
        DATE(created_at) as date,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
      FROM email_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC`
    );

    res.json({
      success: true,
      data: {
        overall: overallStats[0],
        by_type: byType,
        by_status: byStatus,
        daily: dailyStats
      }
    });
  } catch (error) {
    console.error('Error fetching email statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching email statistics',
      error: error.message
    });
  }
});

// =====================================================
// GET SINGLE EMAIL LOG BY ID
// =====================================================
router.get('/:id', async (req, res) => {
  try {
    const [logs] = await db.query(
      `SELECT
        el.*,
        ss.setting_name as smtp_config_name,
        ss.smtp_host as smtp_host
      FROM email_logs el
      LEFT JOIN smtp_settings ss ON el.smtp_setting_id = ss.id
      WHERE el.id = ?`,
      [req.params.id]
    );

    if (logs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Email log not found'
      });
    }

    res.json({
      success: true,
      data: logs[0]
    });
  } catch (error) {
    console.error('Error fetching email log:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching email log',
      error: error.message
    });
  }
});

// =====================================================
// CREATE NEW EMAIL LOG (Used by email sending service)
// =====================================================
router.post('/', async (req, res) => {
  try {
    const {
      smtp_setting_id,
      to_email,
      to_name,
      from_email,
      from_name,
      reply_to,
      cc,
      bcc,
      subject,
      body_text,
      body_html,
      attachments,
      status,
      error_message,
      email_type,
      priority,
      sent_at,
      ip_address,
      user_agent,
      triggered_by
    } = req.body;

    // Validation
    if (!to_email || !subject) {
      return res.status(400).json({
        success: false,
        message: 'to_email and subject are required'
      });
    }

    const [result] = await db.query(
      `INSERT INTO email_logs (
        smtp_setting_id, to_email, to_name, from_email, from_name,
        reply_to, cc, bcc, subject, body_text, body_html, attachments,
        status, error_message, email_type, priority, sent_at,
        ip_address, user_agent, triggered_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        smtp_setting_id || null,
        to_email,
        to_name || null,
        from_email || null,
        from_name || null,
        reply_to || null,
        cc || null,
        bcc || null,
        subject,
        body_text || null,
        body_html || null,
        attachments ? JSON.stringify(attachments) : null,
        status || 'pending',
        error_message || null,
        email_type || null,
        priority || 'normal',
        sent_at || null,
        ip_address || null,
        user_agent || null,
        triggered_by || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Email log created successfully',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('Error creating email log:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating email log',
      error: error.message
    });
  }
});

// =====================================================
// UPDATE EMAIL LOG STATUS
// =====================================================
router.put('/:id/status', async (req, res) => {
  try {
    const { status, error_message, sent_at, opened_at, clicked_at, bounced_at } = req.body;

    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    if (error_message !== undefined) {
      updates.push('error_message = ?');
      params.push(error_message);
    }

    if (sent_at) {
      updates.push('sent_at = ?');
      params.push(sent_at);
    }

    if (opened_at) {
      updates.push('opened_at = ?');
      params.push(opened_at);
    }

    if (clicked_at) {
      updates.push('clicked_at = ?');
      params.push(clicked_at);
    }

    if (bounced_at) {
      updates.push('bounced_at = ?');
      params.push(bounced_at);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    params.push(req.params.id);

    await db.query(
      `UPDATE email_logs SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({
      success: true,
      message: 'Email log status updated successfully'
    });
  } catch (error) {
    console.error('Error updating email log status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating email log status',
      error: error.message
    });
  }
});

// =====================================================
// DELETE EMAIL LOG
// =====================================================
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM email_logs WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Email log not found'
      });
    }

    res.json({
      success: true,
      message: 'Email log deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting email log:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting email log',
      error: error.message
    });
  }
});

// =====================================================
// BULK DELETE EMAIL LOGS
// =====================================================
router.post('/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ids array is required'
      });
    }

    const placeholders = ids.map(() => '?').join(',');
    const [result] = await db.query(
      `DELETE FROM email_logs WHERE id IN (${placeholders})`,
      ids
    );

    res.json({
      success: true,
      message: `${result.affectedRows} email log(s) deleted successfully`,
      deleted_count: result.affectedRows
    });
  } catch (error) {
    console.error('Error bulk deleting email logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting email logs',
      error: error.message
    });
  }
});

// =====================================================
// RETRY FAILED EMAIL
// =====================================================
router.post('/:id/retry', async (req, res) => {
  try {
    // Get the failed email log
    const [logs] = await db.query(
      'SELECT * FROM email_logs WHERE id = ? AND status = "failed"',
      [req.params.id]
    );

    if (logs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Failed email log not found'
      });
    }

    // Update status to pending for retry
    await db.query(
      'UPDATE email_logs SET status = "pending", error_message = NULL WHERE id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Email marked for retry. It will be processed by the email queue.'
    });

    // TODO: Implement actual email resending logic using nodemailer
    // This is just updating the status, actual sending should be done by a background job
  } catch (error) {
    console.error('Error retrying email:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrying email',
      error: error.message
    });
  }
});

// =====================================================
// GET UNIQUE EMAIL TYPES (for filter dropdown)
// =====================================================
router.get('/filters/types', async (req, res) => {
  try {
    const [types] = await db.query(
      'SELECT DISTINCT email_type FROM email_logs WHERE email_type IS NOT NULL ORDER BY email_type'
    );

    res.json({
      success: true,
      data: types.map(t => t.email_type)
    });
  } catch (error) {
    console.error('Error fetching email types:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching email types',
      error: error.message
    });
  }
});

// =====================================================
// TEST ROUTE - Create a test email log entry
// =====================================================
router.post('/test-insert', async (req, res) => {
  try {
    console.log('🧪 Testing email log insertion...');

    const [result] = await db.query(
      `INSERT INTO email_logs (
        to_email, to_name, from_email, from_name,
        subject, body_text, status, email_type, sent_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'test@example.com',
        'Test User',
        'admin@forte.ac.in',
        'Forte Institute',
        'Test Email Log Entry',
        'This is a test email log created for debugging',
        'sent',
        'test',
        new Date()
      ]
    );

    console.log('✅ Test email log inserted! ID:', result.insertId);

    res.json({
      success: true,
      message: 'Test email log created successfully',
      insertId: result.insertId
    });
  } catch (error) {
    console.error('❌ Error inserting test email log:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating test email log',
      error: error.message
    });
  }
});

module.exports = router;
