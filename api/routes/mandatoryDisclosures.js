const express = require('express');
const router = express.Router();
const db = require('../config/database');

// ========================================
// PAGE HEADER
// ========================================

// Get page header
router.get('/header', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM mandatory_disclosures_header WHERE id = 1'
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
      'SELECT id FROM mandatory_disclosures_header WHERE id = 1'
    );

    if (existing.length > 0) {
      // Update existing
      await db.query(
        'UPDATE mandatory_disclosures_header SET title = ?, subtitle = ?, description = ? WHERE id = 1',
        [title, subtitle, description]
      );
    } else {
      // Insert new
      await db.query(
        'INSERT INTO mandatory_disclosures_header (title, subtitle, description) VALUES (?, ?, ?)',
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
// DISCLOSURE CATEGORIES
// ========================================

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM disclosure_categories WHERE is_active = TRUE ORDER BY display_order'
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// Get single category
router.get('/categories/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM disclosure_categories WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
});

// Add category
router.post('/categories', async (req, res) => {
  try {
    const {
      category_name,
      category_slug,
      description,
      icon,
      display_order
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO disclosure_categories
      (category_name, category_slug, description, icon, display_order)
      VALUES (?, ?, ?, ?, ?)`,
      [category_name, category_slug, description, icon, display_order || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Category added successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add category',
      error: error.message
    });
  }
});

// Update category
router.put('/categories/:id', async (req, res) => {
  try {
    const {
      category_name,
      category_slug,
      description,
      icon,
      display_order
    } = req.body;

    const [result] = await db.query(
      `UPDATE disclosure_categories
      SET category_name = ?, category_slug = ?, description = ?, icon = ?, display_order = ?
      WHERE id = ?`,
      [category_name, category_slug, description, icon, display_order, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
});

// Delete category (soft delete)
router.delete('/categories/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'UPDATE disclosure_categories SET is_active = FALSE WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
});

// ========================================
// DISCLOSURE DOCUMENTS
// ========================================

// Get all documents (with optional filters)
router.get('/documents', async (req, res) => {
  try {
    const { category_id, academic_year, is_featured } = req.query;

    let query = `
      SELECT dd.*, dc.category_name, dc.category_slug
      FROM disclosure_documents dd
      LEFT JOIN disclosure_categories dc ON dd.category_id = dc.id
      WHERE dd.is_active = TRUE
    `;
    const params = [];

    if (category_id) {
      query += ' AND dd.category_id = ?';
      params.push(category_id);
    }

    if (academic_year) {
      query += ' AND dd.academic_year = ?';
      params.push(academic_year);
    }

    if (is_featured !== undefined) {
      query += ' AND dd.is_featured = ?';
      params.push(is_featured === 'true' || is_featured === '1');
    }

    query += ' ORDER BY dc.display_order, dd.display_order';

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

// Get documents by category slug
router.get('/documents/category/:slug', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT dd.*, dc.category_name, dc.category_slug
      FROM disclosure_documents dd
      INNER JOIN disclosure_categories dc ON dd.category_id = dc.id
      WHERE dc.category_slug = ? AND dd.is_active = TRUE AND dc.is_active = TRUE
      ORDER BY dd.display_order`,
      [req.params.slug]
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching documents by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
});

// Get single document
router.get('/documents/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT dd.*, dc.category_name, dc.category_slug
      FROM disclosure_documents dd
      LEFT JOIN disclosure_categories dc ON dd.category_id = dc.id
      WHERE dd.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document',
      error: error.message
    });
  }
});

// Add document
router.post('/documents', async (req, res) => {
  try {
    const {
      category_id,
      document_title,
      document_type,
      file_url,
      file_size,
      description,
      academic_year,
      uploaded_date,
      is_featured,
      display_order
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO disclosure_documents
      (category_id, document_title, document_type, file_url, file_size, description, academic_year, uploaded_date, is_featured, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [category_id, document_title, document_type, file_url, file_size, description, academic_year, uploaded_date, is_featured || false, display_order || 0]
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
      category_id,
      document_title,
      document_type,
      file_url,
      file_size,
      description,
      academic_year,
      uploaded_date,
      is_featured,
      display_order
    } = req.body;

    const [result] = await db.query(
      `UPDATE disclosure_documents
      SET category_id = ?, document_title = ?, document_type = ?, file_url = ?,
          file_size = ?, description = ?, academic_year = ?, uploaded_date = ?,
          is_featured = ?, display_order = ?
      WHERE id = ?`,
      [category_id, document_title, document_type, file_url, file_size, description, academic_year, uploaded_date, is_featured, display_order, req.params.id]
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

// Delete document (soft delete)
router.delete('/documents/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'UPDATE disclosure_documents SET is_active = FALSE WHERE id = ?',
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
// STATISTICS & SUMMARY
// ========================================

// Get statistics
router.get('/statistics', async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM disclosure_categories WHERE is_active = TRUE) as total_categories,
        (SELECT COUNT(*) FROM disclosure_documents WHERE is_active = TRUE) as total_documents,
        (SELECT COUNT(*) FROM disclosure_documents WHERE is_featured = TRUE AND is_active = TRUE) as featured_documents,
        (SELECT COUNT(DISTINCT academic_year) FROM disclosure_documents WHERE is_active = TRUE) as academic_years
    `);

    // Get documents count by category
    const [categoryStats] = await db.query(`
      SELECT dc.id, dc.category_name, dc.category_slug, COUNT(dd.id) as document_count
      FROM disclosure_categories dc
      LEFT JOIN disclosure_documents dd ON dc.id = dd.category_id AND dd.is_active = TRUE
      WHERE dc.is_active = TRUE
      GROUP BY dc.id, dc.category_name, dc.category_slug
      ORDER BY dc.display_order
    `);

    res.json({
      success: true,
      data: {
        overview: stats[0],
        categoryWise: categoryStats
      }
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

// Get complete page data (header + categories + documents)
router.get('/complete', async (req, res) => {
  try {
    // Get header
    const [header] = await db.query(
      'SELECT * FROM mandatory_disclosures_header WHERE id = 1'
    );

    // Get categories
    const [categories] = await db.query(
      'SELECT * FROM disclosure_categories WHERE is_active = TRUE ORDER BY display_order'
    );

    // Get all documents with category info
    const [documents] = await db.query(`
      SELECT dd.*, dc.category_name, dc.category_slug
      FROM disclosure_documents dd
      LEFT JOIN disclosure_categories dc ON dd.category_id = dc.id
      WHERE dd.is_active = TRUE AND dc.is_active = TRUE
      ORDER BY dc.display_order, dd.display_order
    `);

    res.json({
      success: true,
      data: {
        header: header[0] || null,
        categories: categories,
        documents: documents
      }
    });
  } catch (error) {
    console.error('Error fetching complete data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complete data',
      error: error.message
    });
  }
});

module.exports = router;
