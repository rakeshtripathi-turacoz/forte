const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all events
router.get('/', async (req, res) => {
  try {
    const [events] = await db.query(
      'SELECT * FROM events ORDER BY event_date DESC'
    );
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
});

// Get single event by ID
router.get('/:id', async (req, res) => {
  try {
    const [events] = await db.query(
      'SELECT * FROM events WHERE id = ?',
      [req.params.id]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: events[0]
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event'
    });
  }
});

// Create new event (requires authentication)
router.post('/', async (req, res) => {
  try {
    const { title, description, event_date, location, image_url } = req.body;

    const [result] = await db.query(
      'INSERT INTO events (title, description, event_date, location, image_url) VALUES (?, ?, ?, ?, ?)',
      [title, description, event_date, location, image_url]
    );

    res.json({
      success: true,
      message: 'Event created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event'
    });
  }
});

// Update event (requires authentication)
router.put('/:id', async (req, res) => {
  try {
    const { title, description, event_date, location, image_url } = req.body;

    await db.query(
      'UPDATE events SET title = ?, description = ?, event_date = ?, location = ?, image_url = ? WHERE id = ?',
      [title, description, event_date, location, image_url, req.params.id]
    );

    res.json({
      success: true,
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event'
    });
  }
});

// Delete event (requires authentication)
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM events WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event'
    });
  }
});

module.exports = router;
