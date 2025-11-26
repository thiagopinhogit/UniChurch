const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const WelcomeAction = require('../models/WelcomeAction');

// Get events for mural (by church)
router.get('/church/:church_id', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;

    const events = await Event.find({ church_id: req.params.church_id })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user_id', 'name photo_url')
      .populate('group_id', 'name type emoji')
      .lean();

    // For each event, get who gave welcomes
    for (let event of events) {
      const welcomeActions = await WelcomeAction.find({ event_id: event._id })
        .populate('from_user_id', 'name photo_url')
        .sort({ created_at: -1 })
        .limit(5) // Only get first 5 names
        .lean();
      
      event.welcomed_by = welcomeActions.map(wa => wa.from_user_id);
    }

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('user_id', 'name photo_url')
      .populate('group_id', 'name type emoji')
      .lean();
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

