const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ============================================
// MULTER CONFIGURATION FOR IMAGE UPLOADS
// ============================================

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/gallery');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename: timestamp-originalname
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
// 1. GALLERY CATEGORIES ROUTES
// ============================================

// GET all categories
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await db.query(
      'SELECT * FROM gallery_categories WHERE is_active = TRUE ORDER BY display_order ASC'
    );
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories', error: error.message });
  }
});

// GET all categories (including inactive for admin)
router.get('/categories/all', async (req, res) => {
  try {
    const [categories] = await db.query(
      'SELECT * FROM gallery_categories ORDER BY display_order ASC'
    );
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching all categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories', error: error.message });
  }
});

// POST create new category
router.post('/categories', async (req, res) => {
  try {
    const { category_name, category_slug, category_description, display_order } = req.body;

    if (!category_name || !category_slug) {
      return res.status(400).json({ success: false, message: 'Category name and slug are required' });
    }

    const [result] = await db.query(
      `INSERT INTO gallery_categories (category_name, category_slug, category_description, display_order)
       VALUES (?, ?, ?, ?)`,
      [category_name, category_slug, category_description || null, display_order || 0]
    );

    res.json({ success: true, message: 'Category created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, message: 'Failed to create category', error: error.message });
  }
});

// PUT update category
router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, category_slug, category_description, display_order, is_active } = req.body;

    const [result] = await db.query(
      `UPDATE gallery_categories
       SET category_name = ?, category_slug = ?, category_description = ?,
           display_order = ?, is_active = ?
       WHERE id = ?`,
      [category_name, category_slug, category_description, display_order, is_active, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, message: 'Category updated successfully' });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, message: 'Failed to update category', error: error.message });
  }
});

// DELETE category
router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has images
    const [images] = await db.query('SELECT COUNT(*) as count FROM gallery_images WHERE category_id = ?', [id]);

    if (images[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing images. Please delete or reassign the images first.'
      });
    }

    const [result] = await db.query('DELETE FROM gallery_categories WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, message: 'Failed to delete category', error: error.message });
  }
});

// ============================================
// 2. GALLERY IMAGES ROUTES
// ============================================

// GET all images with category info
router.get('/images', async (req, res) => {
  try {
    const { category_id, category_slug } = req.query;

    let query = `
      SELECT gi.*, gc.category_name, gc.category_slug
      FROM gallery_images gi
      JOIN gallery_categories gc ON gi.category_id = gc.id
      WHERE gi.is_active = TRUE AND gc.is_active = TRUE
    `;
    const params = [];

    if (category_id) {
      query += ' AND gi.category_id = ?';
      params.push(category_id);
    }

    if (category_slug) {
      query += ' AND gc.category_slug = ?';
      params.push(category_slug);
    }

    query += ' ORDER BY gi.display_order ASC, gi.upload_date DESC';

    const [images] = await db.query(query, params);
    res.json({ success: true, data: images });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch images', error: error.message });
  }
});

// GET all images (including inactive for admin)
router.get('/images/all', async (req, res) => {
  try {
    const [images] = await db.query(`
      SELECT gi.*, gc.category_name, gc.category_slug
      FROM gallery_images gi
      JOIN gallery_categories gc ON gi.category_id = gc.id
      ORDER BY gi.display_order ASC, gi.upload_date DESC
    `);
    res.json({ success: true, data: images });
  } catch (error) {
    console.error('Error fetching all images:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch images', error: error.message });
  }
});

// GET single image
router.get('/images/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [images] = await db.query(`
      SELECT gi.*, gc.category_name, gc.category_slug
      FROM gallery_images gi
      JOIN gallery_categories gc ON gi.category_id = gc.id
      WHERE gi.id = ?
    `, [id]);

    if (images.length === 0) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    res.json({ success: true, data: images[0] });
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch image', error: error.message });
  }
});

// POST create new image with upload
router.post('/images', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    const { title, description, category_id, photographer, display_order } = req.body;

    if (!title || !category_id) {
      // Delete uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Title and category are required' });
    }

    // Store relative path from backend root
    const imagePath = `uploads/gallery/${req.file.filename}`;

    const [result] = await db.query(
      `INSERT INTO gallery_images (title, description, image_path, category_id, upload_date, photographer, display_order)
       VALUES (?, ?, ?, ?, CURRENT_DATE, ?, ?)`,
      [title, description || null, imagePath, category_id, photographer || null, display_order || 0]
    );

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      id: result.insertId,
      imagePath: imagePath
    });
  } catch (error) {
    // Delete uploaded file if database insert fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error uploading image:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image', error: error.message });
  }
});

// PUT update image (with optional new file upload)
router.put('/images/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category_id, photographer, display_order, is_active } = req.body;

    // Get existing image data
    const [existing] = await db.query('SELECT image_path FROM gallery_images WHERE id = ?', [id]);

    if (existing.length === 0) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    let imagePath = existing[0].image_path;

    // If new file uploaded, delete old file and update path
    if (req.file) {
      // Delete old file
      const oldFilePath = path.join(__dirname, '..', existing[0].image_path);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      // Update to new file path
      imagePath = `uploads/gallery/${req.file.filename}`;
    }

    const [result] = await db.query(
      `UPDATE gallery_images
       SET title = ?, description = ?, image_path = ?, category_id = ?,
           photographer = ?, display_order = ?, is_active = ?
       WHERE id = ?`,
      [title, description, imagePath, category_id, photographer, display_order, is_active, id]
    );

    res.json({ success: true, message: 'Image updated successfully', imagePath: imagePath });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error updating image:', error);
    res.status(500).json({ success: false, message: 'Failed to update image', error: error.message });
  }
});

// DELETE image
router.delete('/images/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get image data to delete file
    const [images] = await db.query('SELECT image_path FROM gallery_images WHERE id = ?', [id]);

    if (images.length === 0) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', images[0].image_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await db.query('DELETE FROM gallery_images WHERE id = ?', [id]);

    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ success: false, message: 'Failed to delete image', error: error.message });
  }
});

// ============================================
// 3. GALLERY STATS ROUTES
// ============================================

// GET all stats
router.get('/stats', async (req, res) => {
  try {
    const [stats] = await db.query(
      'SELECT * FROM gallery_stats WHERE is_active = TRUE ORDER BY display_order ASC'
    );
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats', error: error.message });
  }
});

// GET all stats (including inactive for admin)
router.get('/stats/all', async (req, res) => {
  try {
    const [stats] = await db.query('SELECT * FROM gallery_stats ORDER BY display_order ASC');
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching all stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats', error: error.message });
  }
});

// POST create new stat
router.post('/stats', async (req, res) => {
  try {
    const { stat_title, stat_value, stat_description, display_order } = req.body;

    if (!stat_title || !stat_value || !stat_description) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const [result] = await db.query(
      `INSERT INTO gallery_stats (stat_title, stat_value, stat_description, display_order)
       VALUES (?, ?, ?, ?)`,
      [stat_title, stat_value, stat_description, display_order || 0]
    );

    res.json({ success: true, message: 'Stat created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating stat:', error);
    res.status(500).json({ success: false, message: 'Failed to create stat', error: error.message });
  }
});

// PUT update stat
router.put('/stats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { stat_title, stat_value, stat_description, display_order, is_active } = req.body;

    const [result] = await db.query(
      `UPDATE gallery_stats
       SET stat_title = ?, stat_value = ?, stat_description = ?, display_order = ?, is_active = ?
       WHERE id = ?`,
      [stat_title, stat_value, stat_description, display_order, is_active, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Stat not found' });
    }

    res.json({ success: true, message: 'Stat updated successfully' });
  } catch (error) {
    console.error('Error updating stat:', error);
    res.status(500).json({ success: false, message: 'Failed to update stat', error: error.message });
  }
});

// DELETE stat
router.delete('/stats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM gallery_stats WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Stat not found' });
    }

    res.json({ success: true, message: 'Stat deleted successfully' });
  } catch (error) {
    console.error('Error deleting stat:', error);
    res.status(500).json({ success: false, message: 'Failed to delete stat', error: error.message });
  }
});

// ============================================
// 4. PAGE HEADER ROUTES
// ============================================

// GET page header
router.get('/header', async (req, res) => {
  try {
    const [header] = await db.query('SELECT * FROM gallery_page_header LIMIT 1');
    res.json({ success: true, data: header.length > 0 ? header[0] : null });
  } catch (error) {
    console.error('Error fetching page header:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch page header', error: error.message });
  }
});

// PUT update page header
router.put('/header', async (req, res) => {
  try {
    const { page_title, page_description } = req.body;

    // Check if record exists
    const [existing] = await db.query('SELECT id FROM gallery_page_header LIMIT 1');

    if (existing.length > 0) {
      // Update existing
      await db.query(
        'UPDATE gallery_page_header SET page_title = ?, page_description = ? WHERE id = ?',
        [page_title, page_description, existing[0].id]
      );
    } else {
      // Insert new
      await db.query(
        'INSERT INTO gallery_page_header (page_title, page_description) VALUES (?, ?)',
        [page_title, page_description]
      );
    }

    res.json({ success: true, message: 'Page header updated successfully' });
  } catch (error) {
    console.error('Error updating page header:', error);
    res.status(500).json({ success: false, message: 'Failed to update page header', error: error.message });
  }
});

module.exports = router;
