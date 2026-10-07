const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/announcements');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Sanitize filename - remove spaces and special characters
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, 'announcement-' + uniqueSuffix + '-' + sanitizedName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Allow common document and image formats
    const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|jpg|jpeg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, JPEG, PNG, GIF files are allowed.'));
    }
  }
});

// ============================================================================
// GET ALL ANNOUNCEMENTS
// ============================================================================
router.get('/', async (req, res) => {
  try {
    const { limit, category, featured } = req.query;

    let query = 'SELECT * FROM announcements WHERE is_active = TRUE';
    const params = [];

    // Filter by category
    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    // Filter by featured
    if (featured === 'true') {
      query += ' AND is_featured = TRUE';
    }

    // Order by date descending
    query += ' ORDER BY announcement_date DESC';

    // Limit results
    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    const [rows] = await db.query(query, params);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching announcements',
      error: error.message
    });
  }
});

// ============================================================================
// GET ALL ANNOUNCEMENTS (INCLUDING INACTIVE) - FOR ADMIN
// ============================================================================
router.get('/all', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM announcements ORDER BY announcement_date DESC'
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching all announcements:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching announcements',
      error: error.message
    });
  }
});

// ============================================================================
// GET SINGLE ANNOUNCEMENT BY ID
// ============================================================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      'SELECT * FROM announcements WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching announcement',
      error: error.message
    });
  }
});

// ============================================================================
// GET CATEGORIES
// ============================================================================
router.get('/meta/categories', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT DISTINCT category FROM announcements ORDER BY category'
    );

    const categories = rows.map(row => row.category);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

// ============================================================================
// CREATE NEW ANNOUNCEMENT (with file upload)
// ============================================================================
router.post('/', upload.single('attachment'), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      announcement_date,
      link_url,
      is_featured,
      is_active,
      display_order
    } = req.body;

    // Validation
    if (!title || !announcement_date) {
      return res.status(400).json({
        success: false,
        message: 'Title and announcement date are required'
      });
    }

    // Get file info if uploaded
    let attachmentUrl = null;
    let attachmentName = null;

    if (req.file) {
      attachmentUrl = `/uploads/announcements/${req.file.filename}`;
      attachmentName = req.file.originalname;
    }

    // Convert boolean strings to actual integers for MySQL
    const isFeaturedValue = is_featured === 'true' || is_featured === true ? 1 : 0;
    const isActiveValue = is_active === 'false' || is_active === false ? 0 : 1;
    const displayOrderValue = parseInt(display_order) || 0;

    const [result] = await db.query(
      `INSERT INTO announcements
       (title, description, category, announcement_date, link_url, attachment_url, attachment_name, is_featured, is_active, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        category || 'General',
        announcement_date,
        link_url || '#',
        attachmentUrl,
        attachmentName,
        isFeaturedValue,
        isActiveValue,
        displayOrderValue
      ]
    );

    res.json({
      success: true,
      message: 'Announcement created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    // Delete uploaded file if database insert fails
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating announcement',
      error: error.message
    });
  }
});

// ============================================================================
// UPDATE ANNOUNCEMENT (with file upload)
// ============================================================================
router.put('/:id', upload.single('attachment'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      announcement_date,
      link_url,
      is_featured,
      is_active,
      display_order,
      remove_attachment
    } = req.body;

    // Check if announcement exists
    const [existing] = await db.query(
      'SELECT * FROM announcements WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Validation
    if (!title || !announcement_date) {
      return res.status(400).json({
        success: false,
        message: 'Title and announcement date are required'
      });
    }

    // Handle attachment
    let attachmentUrl = existing[0].attachment_url;
    let attachmentName = existing[0].attachment_name;

    // Remove old attachment if requested
    if (remove_attachment === 'true') {
      if (existing[0].attachment_url) {
        const oldFilePath = path.join(__dirname, '../', existing[0].attachment_url);
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error('Error deleting old file:', err);
        });
      }
      attachmentUrl = null;
      attachmentName = null;
    }

    // Add new attachment if uploaded
    if (req.file) {
      // Delete old file if exists
      if (existing[0].attachment_url) {
        const oldFilePath = path.join(__dirname, '../', existing[0].attachment_url);
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error('Error deleting old file:', err);
        });
      }
      attachmentUrl = `/uploads/announcements/${req.file.filename}`;
      attachmentName = req.file.originalname;
    }

    // Convert boolean strings to actual integers for MySQL
    const isFeaturedValue = is_featured === 'true' || is_featured === true ? 1 : 0;
    const isActiveValue = is_active === 'false' || is_active === false ? 0 : 1;
    const displayOrderValue = parseInt(display_order) || 0;

    await db.query(
      `UPDATE announcements
       SET title = ?, description = ?, category = ?, announcement_date = ?,
           link_url = ?, attachment_url = ?, attachment_name = ?, is_featured = ?, is_active = ?, display_order = ?
       WHERE id = ?`,
      [
        title,
        description || null,
        category || 'General',
        announcement_date,
        link_url || '#',
        attachmentUrl,
        attachmentName,
        isFeaturedValue,
        isActiveValue,
        displayOrderValue,
        id
      ]
    );

    res.json({
      success: true,
      message: 'Announcement updated successfully'
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    // Delete uploaded file if database update fails
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating announcement',
      error: error.message
    });
  }
});

// ============================================================================
// DELETE ANNOUNCEMENT
// ============================================================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if announcement exists and get attachment info
    const [existing] = await db.query(
      'SELECT * FROM announcements WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Delete associated file if exists
    if (existing[0].attachment_url) {
      const filePath = path.join(__dirname, '../', existing[0].attachment_url);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    await db.query('DELETE FROM announcements WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting announcement',
      error: error.message
    });
  }
});

module.exports = router;
