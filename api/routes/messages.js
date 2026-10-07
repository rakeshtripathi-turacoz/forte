const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ============================================
// MULTER CONFIGURATION FOR PROFILE IMAGE UPLOADS
// ============================================

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/leadership');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter - only accept images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: fileFilter
});

// ============================================
// ROUTES
// ============================================

// GET /api/messages/:role - Get message by role (chairman, secretary, joint_secretary, director)
router.get('/:role', async (req, res) => {
  try {
    const { role } = req.params;

    // Validate role
    const validRoles = ['chairman', 'secretary', 'joint_secretary', 'director'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role type'
      });
    }

    const [rows] = await db.query(
      'SELECT * FROM leadership_messages WHERE role_type = ? AND is_active = TRUE LIMIT 1',
      [role]
    );

    res.json({
      success: true,
      data: rows[0] || null
    });
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching message',
      error: error.message
    });
  }
});

// PUT /api/messages/:role - Update message by role with optional profile image upload
router.put('/:role', upload.single('profile_image'), async (req, res) => {
  try {
    const { role } = req.params;
    const { name, designation, message_content, quote } = req.body;

    // Validate role
    const validRoles = ['chairman', 'secretary', 'joint_secretary', 'director'];
    if (!validRoles.includes(role)) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Invalid role type'
      });
    }

    // Check if message exists
    const [existing] = await db.query(
      'SELECT id, profile_image_path FROM leadership_messages WHERE role_type = ?',
      [role]
    );

    let imagePath = existing.length > 0 ? existing[0].profile_image_path : null;

    // If new file uploaded, delete old file and update path
    if (req.file) {
      // Delete old file if exists
      if (imagePath) {
        const oldFilePath = path.join(__dirname, '..', imagePath);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Update to new file path
      imagePath = `uploads/leadership/${req.file.filename}`;
    }

    if (existing.length > 0) {
      // Update existing
      await db.query(
        `UPDATE leadership_messages SET
          name = ?,
          designation = ?,
          profile_image_path = ?,
          message_content = ?,
          quote = ?,
          updated_at = NOW()
        WHERE role_type = ?`,
        [name, designation, imagePath, message_content, quote, role]
      );
    } else {
      // Insert new
      await db.query(
        `INSERT INTO leadership_messages
        (role_type, name, designation, profile_image_path, message_content, quote)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [role, name, designation, imagePath, message_content, quote]
      );
    }

    res.json({
      success: true,
      message: `${role.replace('_', ' ').toUpperCase()} message updated successfully`,
      imagePath: imagePath
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error('Error updating message:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating message',
      error: error.message
    });
  }
});

// GET /api/messages - Get all messages
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM leadership_messages WHERE is_active = TRUE ORDER BY FIELD(role_type, "chairman", "secretary", "joint_secretary", "director")'
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching all messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
});

module.exports = router;
