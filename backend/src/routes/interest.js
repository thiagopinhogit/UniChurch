const express = require('express');
const router = express.Router();
const InterestTag = require('../models/InterestTag');

// Get all interest tags
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    const filter = {};
    if (category) {
      filter.category = category;
    }

    const interests = await InterestTag.find(filter).sort({ category: 1, name: 1 });
    res.json(interests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create interest tag
router.post('/', async (req, res) => {
  try {
    const interest = new InterestTag(req.body);
    await interest.save();
    res.status(201).json(interest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

