const express = require('express');
const router = express.Router();
const db = require('../config/database');

// ============================================
// ACTIVITIES MANAGEMENT
// ============================================

// Get all activities with their items
router.get('/activities', async (req, res) => {
  try {
    const [activities] = await db.query(
      `SELECT * FROM life_at_fit_activities
       WHERE is_active = TRUE
       ORDER BY display_order ASC`
    );

    // Get items for each activity
    for (let activity of activities) {
      const [items] = await db.query(
        `SELECT * FROM life_at_fit_activity_items
         WHERE activity_id = ? AND is_active = TRUE
         ORDER BY display_order ASC`,
        [activity.id]
      );
      activity.items = items;
    }

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities',
      error: error.message
    });
  }
});

// Get single activity
router.get('/activities/:id', async (req, res) => {
  try {
    const [activities] = await db.query(
      'SELECT * FROM life_at_fit_activities WHERE id = ?',
      [req.params.id]
    );

    if (activities.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    const activity = activities[0];

    // Get items
    const [items] = await db.query(
      `SELECT * FROM life_at_fit_activity_items
       WHERE activity_id = ?
       ORDER BY display_order ASC`,
      [activity.id]
    );
    activity.items = items;

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity',
      error: error.message
    });
  }
});

// Create new activity
router.post('/activities', async (req, res) => {
  try {
    const { title, icon, description, display_order, items } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    // Insert activity
    const [result] = await db.query(
      `INSERT INTO life_at_fit_activities (title, icon, description, display_order)
       VALUES (?, ?, ?, ?)`,
      [title, icon || 'fas fa-users', description, display_order || 0]
    );

    const activityId = result.insertId;

    // Insert items if provided
    if (items && Array.isArray(items) && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        await db.query(
          `INSERT INTO life_at_fit_activity_items (activity_id, item_name, display_order)
           VALUES (?, ?, ?)`,
          [activityId, items[i].item_name || items[i], i + 1]
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: { id: activityId }
    });
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create activity',
      error: error.message
    });
  }
});

// Update activity
router.put('/activities/:id', async (req, res) => {
  try {
    const { title, icon, description, display_order, is_active, items } = req.body;

    // Update activity
    await db.query(
      `UPDATE life_at_fit_activities
       SET title = ?, icon = ?, description = ?, display_order = ?, is_active = ?
       WHERE id = ?`,
      [title, icon, description, display_order, is_active !== undefined ? is_active : true, req.params.id]
    );

    // If items provided, update them
    if (items && Array.isArray(items)) {
      // Delete existing items
      await db.query(
        'DELETE FROM life_at_fit_activity_items WHERE activity_id = ?',
        [req.params.id]
      );

      // Insert new items
      for (let i = 0; i < items.length; i++) {
        await db.query(
          `INSERT INTO life_at_fit_activity_items (activity_id, item_name, display_order)
           VALUES (?, ?, ?)`,
          [req.params.id, items[i].item_name || items[i], i + 1]
        );
      }
    }

    res.json({
      success: true,
      message: 'Activity updated successfully'
    });
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update activity',
      error: error.message
    });
  }
});

// Delete activity
router.delete('/activities/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM life_at_fit_activities WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete activity',
      error: error.message
    });
  }
});

// ============================================
// FACILITIES MANAGEMENT
// ============================================

// Get all facilities
router.get('/facilities', async (req, res) => {
  try {
    const [facilities] = await db.query(
      `SELECT * FROM life_at_fit_facilities
       WHERE is_active = TRUE
       ORDER BY display_order ASC`
    );

    res.json({
      success: true,
      data: facilities
    });
  } catch (error) {
    console.error('Error fetching facilities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch facilities',
      error: error.message
    });
  }
});

// Create facility
router.post('/facilities', async (req, res) => {
  try {
    const { name, icon, description, display_order } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name and description are required'
      });
    }

    const [result] = await db.query(
      `INSERT INTO life_at_fit_facilities (name, icon, description, display_order)
       VALUES (?, ?, ?, ?)`,
      [name, icon || 'fas fa-building', description, display_order || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Facility created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating facility:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create facility',
      error: error.message
    });
  }
});

// Update facility
router.put('/facilities/:id', async (req, res) => {
  try {
    const { name, icon, description, display_order, is_active } = req.body;

    await db.query(
      `UPDATE life_at_fit_facilities
       SET name = ?, icon = ?, description = ?, display_order = ?, is_active = ?
       WHERE id = ?`,
      [name, icon, description, display_order, is_active !== undefined ? is_active : true, req.params.id]
    );

    res.json({
      success: true,
      message: 'Facility updated successfully'
    });
  } catch (error) {
    console.error('Error updating facility:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update facility',
      error: error.message
    });
  }
});

// Delete facility
router.delete('/facilities/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM life_at_fit_facilities WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Facility deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting facility:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete facility',
      error: error.message
    });
  }
});

// ============================================
// HOSTEL FEATURES MANAGEMENT
// ============================================

// Get hostel features
router.get('/hostel-features', async (req, res) => {
  try {
    const { hostel_type } = req.query;

    let query = 'SELECT * FROM life_at_fit_hostel_features WHERE is_active = TRUE';
    const params = [];

    if (hostel_type) {
      query += ' AND hostel_type = ?';
      params.push(hostel_type);
    }

    query += ' ORDER BY hostel_type, display_order ASC';

    const [features] = await db.query(query, params);

    res.json({
      success: true,
      data: features
    });
  } catch (error) {
    console.error('Error fetching hostel features:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hostel features',
      error: error.message
    });
  }
});

// Create hostel feature
router.post('/hostel-features', async (req, res) => {
  try {
    const { hostel_type, feature_text, display_order } = req.body;

    if (!hostel_type || !feature_text) {
      return res.status(400).json({
        success: false,
        message: 'Hostel type and feature text are required'
      });
    }

    if (!['boys', 'girls'].includes(hostel_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hostel type. Must be "boys" or "girls"'
      });
    }

    const [result] = await db.query(
      `INSERT INTO life_at_fit_hostel_features (hostel_type, feature_text, display_order)
       VALUES (?, ?, ?)`,
      [hostel_type, feature_text, display_order || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Hostel feature created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating hostel feature:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create hostel feature',
      error: error.message
    });
  }
});

// Update hostel feature
router.put('/hostel-features/:id', async (req, res) => {
  try {
    const { hostel_type, feature_text, display_order, is_active } = req.body;

    await db.query(
      `UPDATE life_at_fit_hostel_features
       SET hostel_type = ?, feature_text = ?, display_order = ?, is_active = ?
       WHERE id = ?`,
      [hostel_type, feature_text, display_order, is_active !== undefined ? is_active : true, req.params.id]
    );

    res.json({
      success: true,
      message: 'Hostel feature updated successfully'
    });
  } catch (error) {
    console.error('Error updating hostel feature:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update hostel feature',
      error: error.message
    });
  }
});

// Delete hostel feature
router.delete('/hostel-features/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM life_at_fit_hostel_features WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Hostel feature deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting hostel feature:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete hostel feature',
      error: error.message
    });
  }
});

// ============================================
// TESTIMONIALS MANAGEMENT
// ============================================

// Get all testimonials
router.get('/testimonials', async (req, res) => {
  try {
    const { is_featured } = req.query;

    let query = 'SELECT * FROM life_at_fit_testimonials WHERE is_active = TRUE';
    const params = [];

    if (is_featured !== undefined) {
      query += ' AND is_featured = ?';
      params.push(is_featured === 'true' ? 1 : 0);
    }

    query += ' ORDER BY display_order ASC, created_at DESC';

    const [testimonials] = await db.query(query, params);

    res.json({
      success: true,
      data: testimonials
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials',
      error: error.message
    });
  }
});

// Create testimonial
router.post('/testimonials', async (req, res) => {
  try {
    const { student_name, course, year, testimonial_text, avatar_url, rating, is_featured, display_order } = req.body;

    if (!student_name || !course || !year || !testimonial_text) {
      return res.status(400).json({
        success: false,
        message: 'Student name, course, year, and testimonial text are required'
      });
    }

    const [result] = await db.query(
      `INSERT INTO life_at_fit_testimonials
       (student_name, course, year, testimonial_text, avatar_url, rating, is_featured, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_name, course, year, testimonial_text, avatar_url || null, rating || 5, is_featured || false, display_order || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create testimonial',
      error: error.message
    });
  }
});

// Update testimonial
router.put('/testimonials/:id', async (req, res) => {
  try {
    const { student_name, course, year, testimonial_text, avatar_url, rating, is_featured, is_active, display_order } = req.body;

    await db.query(
      `UPDATE life_at_fit_testimonials
       SET student_name = ?, course = ?, year = ?, testimonial_text = ?,
           avatar_url = ?, rating = ?, is_featured = ?, is_active = ?, display_order = ?
       WHERE id = ?`,
      [student_name, course, year, testimonial_text, avatar_url, rating, is_featured, is_active !== undefined ? is_active : true, display_order, req.params.id]
    );

    res.json({
      success: true,
      message: 'Testimonial updated successfully'
    });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update testimonial',
      error: error.message
    });
  }
});

// Delete testimonial
router.delete('/testimonials/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM life_at_fit_testimonials WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete testimonial',
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
    const [activitiesCount] = await db.query('SELECT COUNT(*) as count FROM life_at_fit_activities WHERE is_active = TRUE');
    const [facilitiesCount] = await db.query('SELECT COUNT(*) as count FROM life_at_fit_facilities WHERE is_active = TRUE');
    const [testimonialsCount] = await db.query('SELECT COUNT(*) as count FROM life_at_fit_testimonials WHERE is_active = TRUE');
    const [hostelFeaturesCount] = await db.query('SELECT COUNT(*) as count FROM life_at_fit_hostel_features WHERE is_active = TRUE');

    res.json({
      success: true,
      data: {
        activities: activitiesCount[0].count,
        facilities: facilitiesCount[0].count,
        testimonials: testimonialsCount[0].count,
        hostel_features: hostelFeaturesCount[0].count
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
