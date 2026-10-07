const express = require('express');
const router = express.Router();
const db = require('../config/database');

// ============================================
// ACHIEVEMENT CATEGORIES
// ============================================

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await db.query(
      `SELECT * FROM achievement_categories
       WHERE is_active = TRUE
       ORDER BY display_order ASC`
    );

    res.json({
      success: true,
      data: categories
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

// Create category
router.post('/categories', async (req, res) => {
  try {
    const { category_name, icon, description, display_order } = req.body;

    if (!category_name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const [result] = await db.query(
      `INSERT INTO achievement_categories (category_name, icon, description, display_order)
       VALUES (?, ?, ?, ?)`,
      [category_name, icon || 'fas fa-star', description, display_order || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
});

// Update category
router.put('/categories/:id', async (req, res) => {
  try {
    const { category_name, icon, description, display_order, is_active } = req.body;

    await db.query(
      `UPDATE achievement_categories
       SET category_name = ?, icon = ?, description = ?, display_order = ?, is_active = ?
       WHERE id = ?`,
      [category_name, icon, description, display_order, is_active !== undefined ? is_active : true, req.params.id]
    );

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

// Delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM achievement_categories WHERE id = ?', [req.params.id]);

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

// ============================================
// INSTITUTIONAL AWARDS
// ============================================

// Get all institutional awards
router.get('/institutional-awards', async (req, res) => {
  try {
    const { year } = req.query;

    let query = 'SELECT * FROM institutional_awards WHERE is_active = TRUE';
    const params = [];

    if (year) {
      query += ' AND year = ?';
      params.push(year);
    }

    query += ' ORDER BY year DESC, display_order ASC';

    const [awards] = await db.query(query, params);

    res.json({
      success: true,
      data: awards
    });
  } catch (error) {
    console.error('Error fetching institutional awards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch institutional awards',
      error: error.message
    });
  }
});

// Create institutional award
router.post('/institutional-awards', async (req, res) => {
  try {
    const { year, title, organization, icon, description, image_url, display_order } = req.body;

    if (!year || !title || !organization) {
      return res.status(400).json({
        success: false,
        message: 'Year, title, and organization are required'
      });
    }

    const [result] = await db.query(
      `INSERT INTO institutional_awards (year, title, organization, icon, description, image_url, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [year, title, organization, icon || 'fas fa-trophy', description, image_url, display_order || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Institutional award created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating institutional award:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create institutional award',
      error: error.message
    });
  }
});

// Update institutional award
router.put('/institutional-awards/:id', async (req, res) => {
  try {
    const { year, title, organization, icon, description, image_url, display_order, is_active } = req.body;

    await db.query(
      `UPDATE institutional_awards
       SET year = ?, title = ?, organization = ?, icon = ?, description = ?,
           image_url = ?, display_order = ?, is_active = ?
       WHERE id = ?`,
      [year, title, organization, icon, description, image_url, display_order,
       is_active !== undefined ? is_active : true, req.params.id]
    );

    res.json({
      success: true,
      message: 'Institutional award updated successfully'
    });
  } catch (error) {
    console.error('Error updating institutional award:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update institutional award',
      error: error.message
    });
  }
});

// Delete institutional award
router.delete('/institutional-awards/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM institutional_awards WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Institutional award deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting institutional award:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete institutional award',
      error: error.message
    });
  }
});

// ============================================
// STUDENT ACHIEVEMENTS
// ============================================

// Get all student achievements (with categories)
router.get('/student-achievements', async (req, res) => {
  try {
    const { category_id } = req.query;

    let query = `
      SELECT
        sa.*,
        ac.category_name,
        ac.icon as category_icon
      FROM student_achievements sa
      JOIN achievement_categories ac ON sa.category_id = ac.id
      WHERE sa.is_active = TRUE
    `;
    const params = [];

    if (category_id) {
      query += ' AND sa.category_id = ?';
      params.push(category_id);
    }

    query += ' ORDER BY ac.display_order ASC, sa.display_order ASC';

    const [achievements] = await db.query(query, params);

    // Group by category
    const groupedAchievements = achievements.reduce((acc, achievement) => {
      const categoryName = achievement.category_name;
      if (!acc[categoryName]) {
        acc[categoryName] = {
          category_name: categoryName,
          category_icon: achievement.category_icon,
          achievements: []
        };
      }
      acc[categoryName].achievements.push(achievement);
      return acc;
    }, {});

    res.json({
      success: true,
      data: Object.values(groupedAchievements)
    });
  } catch (error) {
    console.error('Error fetching student achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student achievements',
      error: error.message
    });
  }
});

// Get student achievements (ungrouped for admin)
router.get('/student-achievements/list', async (req, res) => {
  try {
    const [achievements] = await db.query(
      `SELECT
        sa.*,
        ac.category_name
      FROM student_achievements sa
      JOIN achievement_categories ac ON sa.category_id = ac.id
      WHERE sa.is_active = TRUE
      ORDER BY sa.display_order ASC`
    );

    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    console.error('Error fetching student achievements list:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student achievements',
      error: error.message
    });
  }
});

// Create student achievement
router.post('/student-achievements', async (req, res) => {
  try {
    const {
      category_id, title, event_name, participants, prize,
      achievement_date, description, image_url, display_order
    } = req.body;

    if (!category_id || !title || !event_name || !participants || !prize) {
      return res.status(400).json({
        success: false,
        message: 'Category, title, event name, participants, and prize are required'
      });
    }

    const [result] = await db.query(
      `INSERT INTO student_achievements
       (category_id, title, event_name, participants, prize, achievement_date, description, image_url, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [category_id, title, event_name, participants, prize, achievement_date, description, image_url, display_order || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Student achievement created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating student achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create student achievement',
      error: error.message
    });
  }
});

// Update student achievement
router.put('/student-achievements/:id', async (req, res) => {
  try {
    const {
      category_id, title, event_name, participants, prize,
      achievement_date, description, image_url, display_order, is_active
    } = req.body;

    await db.query(
      `UPDATE student_achievements
       SET category_id = ?, title = ?, event_name = ?, participants = ?, prize = ?,
           achievement_date = ?, description = ?, image_url = ?, display_order = ?, is_active = ?
       WHERE id = ?`,
      [category_id, title, event_name, participants, prize, achievement_date, description,
       image_url, display_order, is_active !== undefined ? is_active : true, req.params.id]
    );

    res.json({
      success: true,
      message: 'Student achievement updated successfully'
    });
  } catch (error) {
    console.error('Error updating student achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student achievement',
      error: error.message
    });
  }
});

// Delete student achievement
router.delete('/student-achievements/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM student_achievements WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Student achievement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting student achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete student achievement',
      error: error.message
    });
  }
});

// ============================================
// FACULTY ACHIEVEMENTS
// ============================================

// Get all faculty achievements
router.get('/faculty-achievements', async (req, res) => {
  try {
    const { department, achievement_type } = req.query;

    let query = 'SELECT * FROM faculty_achievements WHERE is_active = TRUE';
    const params = [];

    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }

    if (achievement_type) {
      query += ' AND achievement_type = ?';
      params.push(achievement_type);
    }

    query += ' ORDER BY display_order ASC';

    const [achievements] = await db.query(query, params);

    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    console.error('Error fetching faculty achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch faculty achievements',
      error: error.message
    });
  }
});

// Create faculty achievement
router.post('/faculty-achievements', async (req, res) => {
  try {
    const {
      faculty_name, department, achievement_text, achievement_type,
      achievement_date, image_url, display_order
    } = req.body;

    if (!faculty_name || !department || !achievement_text) {
      return res.status(400).json({
        success: false,
        message: 'Faculty name, department, and achievement text are required'
      });
    }

    const [result] = await db.query(
      `INSERT INTO faculty_achievements
       (faculty_name, department, achievement_text, achievement_type, achievement_date, image_url, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [faculty_name, department, achievement_text, achievement_type || 'other', achievement_date, image_url, display_order || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Faculty achievement created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating faculty achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create faculty achievement',
      error: error.message
    });
  }
});

// Update faculty achievement
router.put('/faculty-achievements/:id', async (req, res) => {
  try {
    const {
      faculty_name, department, achievement_text, achievement_type,
      achievement_date, image_url, display_order, is_active
    } = req.body;

    await db.query(
      `UPDATE faculty_achievements
       SET faculty_name = ?, department = ?, achievement_text = ?, achievement_type = ?,
           achievement_date = ?, image_url = ?, display_order = ?, is_active = ?
       WHERE id = ?`,
      [faculty_name, department, achievement_text, achievement_type, achievement_date,
       image_url, display_order, is_active !== undefined ? is_active : true, req.params.id]
    );

    res.json({
      success: true,
      message: 'Faculty achievement updated successfully'
    });
  } catch (error) {
    console.error('Error updating faculty achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update faculty achievement',
      error: error.message
    });
  }
});

// Delete faculty achievement
router.delete('/faculty-achievements/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM faculty_achievements WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Faculty achievement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting faculty achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete faculty achievement',
      error: error.message
    });
  }
});

// ============================================
// PLACEMENT HIGHLIGHTS
// ============================================

// Get all placement highlights
router.get('/placement-highlights', async (req, res) => {
  try {
    const { year } = req.query;

    let query = 'SELECT * FROM placement_highlights WHERE is_active = TRUE';
    const params = [];

    if (year) {
      query += ' AND year = ?';
      params.push(year);
    }

    query += ' ORDER BY display_order ASC';

    const [placements] = await db.query(query, params);

    res.json({
      success: true,
      data: placements
    });
  } catch (error) {
    console.error('Error fetching placement highlights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch placement highlights',
      error: error.message
    });
  }
});

// Create placement highlight
router.post('/placement-highlights', async (req, res) => {
  try {
    const { company_name, package: pkg, students_placed, year, company_logo, display_order } = req.body;

    if (!company_name || !pkg || !students_placed || !year) {
      return res.status(400).json({
        success: false,
        message: 'Company name, package, students placed, and year are required'
      });
    }

    const [result] = await db.query(
      `INSERT INTO placement_highlights (company_name, package, students_placed, year, company_logo, display_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [company_name, pkg, students_placed, year, company_logo, display_order || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Placement highlight created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating placement highlight:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create placement highlight',
      error: error.message
    });
  }
});

// Update placement highlight
router.put('/placement-highlights/:id', async (req, res) => {
  try {
    const { company_name, package: pkg, students_placed, year, company_logo, display_order, is_active } = req.body;

    await db.query(
      `UPDATE placement_highlights
       SET company_name = ?, package = ?, students_placed = ?, year = ?,
           company_logo = ?, display_order = ?, is_active = ?
       WHERE id = ?`,
      [company_name, pkg, students_placed, year, company_logo, display_order,
       is_active !== undefined ? is_active : true, req.params.id]
    );

    res.json({
      success: true,
      message: 'Placement highlight updated successfully'
    });
  } catch (error) {
    console.error('Error updating placement highlight:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update placement highlight',
      error: error.message
    });
  }
});

// Delete placement highlight
router.delete('/placement-highlights/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM placement_highlights WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Placement highlight deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting placement highlight:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete placement highlight',
      error: error.message
    });
  }
});

// ============================================
// RECOGNITIONS & ACCREDITATIONS
// ============================================

// Get all recognitions
router.get('/recognitions', async (req, res) => {
  try {
    const [recognitions] = await db.query(
      `SELECT * FROM recognitions
       WHERE is_active = TRUE
       ORDER BY display_order ASC`
    );

    res.json({
      success: true,
      data: recognitions
    });
  } catch (error) {
    console.error('Error fetching recognitions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recognitions',
      error: error.message
    });
  }
});

// Create recognition
router.post('/recognitions', async (req, res) => {
  try {
    const { short_name, full_name, description, logo_url, badge_color, display_order } = req.body;

    if (!short_name || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'Short name and full name are required'
      });
    }

    const [result] = await db.query(
      `INSERT INTO recognitions (short_name, full_name, description, logo_url, badge_color, display_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [short_name, full_name, description, logo_url, badge_color || '#dc2626', display_order || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Recognition created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating recognition:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create recognition',
      error: error.message
    });
  }
});

// Update recognition
router.put('/recognitions/:id', async (req, res) => {
  try {
    const { short_name, full_name, description, logo_url, badge_color, display_order, is_active } = req.body;

    await db.query(
      `UPDATE recognitions
       SET short_name = ?, full_name = ?, description = ?, logo_url = ?,
           badge_color = ?, display_order = ?, is_active = ?
       WHERE id = ?`,
      [short_name, full_name, description, logo_url, badge_color, display_order,
       is_active !== undefined ? is_active : true, req.params.id]
    );

    res.json({
      success: true,
      message: 'Recognition updated successfully'
    });
  } catch (error) {
    console.error('Error updating recognition:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update recognition',
      error: error.message
    });
  }
});

// Delete recognition
router.delete('/recognitions/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM recognitions WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Recognition deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting recognition:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete recognition',
      error: error.message
    });
  }
});

// ============================================
// STATISTICS
// ============================================

// Get statistics for admin dashboard
router.get('/statistics', async (req, res) => {
  try {
    const [institutionalCount] = await db.query('SELECT COUNT(*) as count FROM institutional_awards WHERE is_active = TRUE');
    const [studentCount] = await db.query('SELECT COUNT(*) as count FROM student_achievements WHERE is_active = TRUE');
    const [facultyCount] = await db.query('SELECT COUNT(*) as count FROM faculty_achievements WHERE is_active = TRUE');
    const [placementCount] = await db.query('SELECT COUNT(*) as count FROM placement_highlights WHERE is_active = TRUE');
    const [recognitionCount] = await db.query('SELECT COUNT(*) as count FROM recognitions WHERE is_active = TRUE');

    res.json({
      success: true,
      data: {
        institutional_awards: institutionalCount[0].count,
        student_achievements: studentCount[0].count,
        faculty_achievements: facultyCount[0].count,
        placement_highlights: placementCount[0].count,
        recognitions: recognitionCount[0].count
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

module.exports = router;
