const express = require('express');
const router = express.Router();
const db = require('../config/database');

// =====================================================
// GET ALL SMTP SETTINGS
// =====================================================
router.get('/', async (req, res) => {
  try {
    const [settings] = await db.query(
      'SELECT * FROM smtp_settings ORDER BY is_default DESC, created_at DESC'
    );

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching SMTP settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching SMTP settings',
      error: error.message
    });
  }
});

// =====================================================
// GET SINGLE SMTP SETTING BY ID
// =====================================================
router.get('/:id', async (req, res) => {
  try {
    const [settings] = await db.query(
      'SELECT * FROM smtp_settings WHERE id = ?',
      [req.params.id]
    );

    if (settings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'SMTP setting not found'
      });
    }

    res.json({
      success: true,
      data: settings[0]
    });
  } catch (error) {
    console.error('Error fetching SMTP setting:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching SMTP setting',
      error: error.message
    });
  }
});

// =====================================================
// GET DEFAULT/ACTIVE SMTP SETTING
// =====================================================
router.get('/active/default', async (req, res) => {
  try {
    const [settings] = await db.query(
      'SELECT * FROM smtp_settings WHERE is_active = 1 AND is_default = 1 LIMIT 1'
    );

    if (settings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No default SMTP configuration found'
      });
    }

    res.json({
      success: true,
      data: settings[0]
    });
  } catch (error) {
    console.error('Error fetching default SMTP setting:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching default SMTP setting',
      error: error.message
    });
  }
});

// =====================================================
// CREATE NEW SMTP SETTING
// =====================================================
router.post('/', async (req, res) => {
  try {
    const {
      setting_name,
      smtp_host,
      smtp_port,
      smtp_username,
      smtp_password,
      from_email,
      from_name,
      encryption_type,
      is_active,
      is_default,
      description
    } = req.body;

    // Validation
    if (!setting_name || !smtp_host || !smtp_port || !smtp_username || !smtp_password || !from_email || !from_name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if setting_name already exists
    const [existing] = await db.query(
      'SELECT id FROM smtp_settings WHERE setting_name = ?',
      [setting_name]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Setting name already exists'
      });
    }

    // If is_default is true, set all other settings to is_default = 0
    if (is_default) {
      await db.query('UPDATE smtp_settings SET is_default = 0');
    }

    // Insert new setting
    const [result] = await db.query(
      `INSERT INTO smtp_settings (
        setting_name, smtp_host, smtp_port, smtp_username, smtp_password,
        from_email, from_name, encryption_type, is_active, is_default, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        setting_name,
        smtp_host,
        smtp_port || 587,
        smtp_username,
        smtp_password,
        from_email,
        from_name,
        encryption_type || 'tls',
        is_active !== undefined ? is_active : 1,
        is_default || 0,
        description || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'SMTP setting created successfully',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('Error creating SMTP setting:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating SMTP setting',
      error: error.message
    });
  }
});

// =====================================================
// UPDATE SMTP SETTING
// =====================================================
router.put('/:id', async (req, res) => {
  try {
    const {
      setting_name,
      smtp_host,
      smtp_port,
      smtp_username,
      smtp_password,
      from_email,
      from_name,
      encryption_type,
      is_active,
      is_default,
      description
    } = req.body;

    // Check if setting exists
    const [existing] = await db.query(
      'SELECT id FROM smtp_settings WHERE id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'SMTP setting not found'
      });
    }

    // If is_default is true, set all other settings to is_default = 0
    if (is_default) {
      await db.query('UPDATE smtp_settings SET is_default = 0');
    }

    // Update setting
    await db.query(
      `UPDATE smtp_settings SET
        setting_name = ?,
        smtp_host = ?,
        smtp_port = ?,
        smtp_username = ?,
        smtp_password = ?,
        from_email = ?,
        from_name = ?,
        encryption_type = ?,
        is_active = ?,
        is_default = ?,
        description = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        setting_name,
        smtp_host,
        smtp_port,
        smtp_username,
        smtp_password,
        from_email,
        from_name,
        encryption_type,
        is_active,
        is_default,
        description,
        req.params.id
      ]
    );

    res.json({
      success: true,
      message: 'SMTP setting updated successfully'
    });
  } catch (error) {
    console.error('Error updating SMTP setting:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating SMTP setting',
      error: error.message
    });
  }
});

// =====================================================
// DELETE SMTP SETTING
// =====================================================
router.delete('/:id', async (req, res) => {
  try {
    // Check if this is the default setting
    const [setting] = await db.query(
      'SELECT is_default FROM smtp_settings WHERE id = ?',
      [req.params.id]
    );

    if (setting.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'SMTP setting not found'
      });
    }

    if (setting[0].is_default) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete default SMTP setting. Please set another setting as default first.'
      });
    }

    // Delete the setting
    await db.query('DELETE FROM smtp_settings WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'SMTP setting deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting SMTP setting:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting SMTP setting',
      error: error.message
    });
  }
});

// =====================================================
// SET AS DEFAULT
// =====================================================
router.put('/:id/set-default', async (req, res) => {
  try {
    // Check if setting exists
    const [existing] = await db.query(
      'SELECT id FROM smtp_settings WHERE id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'SMTP setting not found'
      });
    }

    // Unset all defaults
    await db.query('UPDATE smtp_settings SET is_default = 0');

    // Set this as default
    await db.query(
      'UPDATE smtp_settings SET is_default = 1, is_active = 1 WHERE id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'SMTP setting set as default successfully'
    });
  } catch (error) {
    console.error('Error setting default SMTP:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting default SMTP',
      error: error.message
    });
  }
});

// =====================================================
// TEST SMTP CONNECTION (Optional - for future implementation)
// =====================================================
router.post('/:id/test', async (req, res) => {
  try {
    const [settings] = await db.query(
      'SELECT * FROM smtp_settings WHERE id = ?',
      [req.params.id]
    );

    if (settings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'SMTP setting not found'
      });
    }

    // TODO: Implement actual SMTP connection test using nodemailer
    // For now, just return success
    res.json({
      success: true,
      message: 'SMTP test functionality will be implemented with nodemailer',
      data: {
        host: settings[0].smtp_host,
        port: settings[0].smtp_port
      }
    });
  } catch (error) {
    console.error('Error testing SMTP:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing SMTP connection',
      error: error.message
    });
  }
});

module.exports = router;
