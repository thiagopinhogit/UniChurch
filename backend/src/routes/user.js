const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Church = require('../models/Church');
const UserInterest = require('../models/UserInterest');
const GroupMember = require('../models/GroupMember');
const Event = require('../models/Event');

// Create new user (onboarding)
router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();

    // Create NEW_MEMBER event for mural
    const event = new Event({
      church_id: user.church_id,
      user_id: user._id,
      type: 'NEW_MEMBER'
    });
    await event.save();

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user by ID with interests
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('cell_id', 'name')
      .lean();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user interests
    const interests = await UserInterest.find({ user_id: user._id })
      .populate('interest_tag_id')
      .lean();
    
    user.interests = interests.map(i => i.interest_tag_id);

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Toggle church admin status
router.patch('/:id/toggle-admin', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.is_church_admin = !user.is_church_admin;
    await user.save();

    res.json({ 
      success: true, 
      is_church_admin: user.is_church_admin,
      user 
    });
  } catch (error) {
    console.error('Toggle admin error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add interest to user
router.post('/:id/interests', async (req, res) => {
  try {
    const { interest_tag_id } = req.body;
    
    const userInterest = new UserInterest({
      user_id: req.params.id,
      interest_tag_id
    });
    
    await userInterest.save();
    res.status(201).json(userInterest);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Interest already added' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Remove interest from user
router.delete('/:id/interests/:interest_tag_id', async (req, res) => {
  try {
    await UserInterest.deleteOne({
      user_id: req.params.id,
      interest_tag_id: req.params.interest_tag_id
    });
    res.json({ message: 'Interest removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users from a church (with privacy filter)
router.get('/church/:church_id/members', async (req, res) => {
  try {
    const users = await User.find({
      church_id: req.params.church_id,
      show_profile: true
    })
    .select('-email -phone')
    .lean();

    // Get interests for each user
    for (let user of users) {
      const interests = await UserInterest.find({ user_id: user._id })
        .populate('interest_tag_id')
        .lean();
      user.interests = interests.map(i => i.interest_tag_id);
    }

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users from a church (admin route - no privacy filter)
router.get('/church/:church_id', async (req, res) => {
  try {
    const users = await User.find({ church_id: req.params.church_id })
      .sort({ created_at: -1 })
      .lean();
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get suggested users (based on common interests)
router.get('/:id/suggestions', async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.id);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's interests
    const userInterests = await UserInterest.find({ user_id: req.params.id })
      .select('interest_tag_id')
      .lean();
    const interestIds = userInterests.map(i => i.interest_tag_id.toString());

    // Find users with common interests
    const usersWithCommonInterests = await UserInterest.find({
      interest_tag_id: { $in: interestIds },
      user_id: { $ne: req.params.id }
    })
    .populate({
      path: 'user_id',
      match: { 
        church_id: currentUser.church_id,
        show_profile: true 
      }
    })
    .lean();

    // Calculate scores
    const scoreMap = {};
    for (let ui of usersWithCommonInterests) {
      if (ui.user_id) {
        const userId = ui.user_id._id.toString();
        scoreMap[userId] = scoreMap[userId] || { user: ui.user_id, score: 0, interests: [] };
        scoreMap[userId].score += 1;
      }
    }

    // Add bonus for same cell
    for (let userId in scoreMap) {
      const user = scoreMap[userId].user;
      if (user.cell_id && currentUser.cell_id && 
          user.cell_id.toString() === currentUser.cell_id.toString()) {
        scoreMap[userId].score += 1;
      }
    }

    // Convert to array and sort by score
    let suggestions = Object.values(scoreMap)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(s => s.user);

    // Get interests for each suggested user
    for (let user of suggestions) {
      const interests = await UserInterest.find({ user_id: user._id })
        .populate('interest_tag_id')
        .lean();
      user.interests = interests.map(i => i.interest_tag_id);
    }

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Give welcome to a user
router.post('/:id/welcome', async (req, res) => {
  try {
    const { from_user_id, event_id } = req.body;
    let targetEvent = null;

    if (event_id) {
      targetEvent = await Event.findById(event_id);

      if (!targetEvent) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (targetEvent.type !== 'NEW_MEMBER') {
        return res.status(400).json({ error: 'Welcomes permitidos apenas para novos membros' });
      }

      if (targetEvent.user_id.toString() !== req.params.id) {
        return res.status(400).json({ error: 'Evento não pertence a este usuário' });
      }
    }
    
    const WelcomeAction = require('../models/WelcomeAction');
    const welcomeAction = new WelcomeAction({
      from_user_id,
      to_user_id: req.params.id,
      event_id
    });
    
    await welcomeAction.save();
    
    // Increment welcome count on user
    await User.findByIdAndUpdate(req.params.id, {
      $inc: { welcome_count: 1 }
    });

    // Increment welcome count on event if event_id is provided
    if (targetEvent) {
      await Event.findByIdAndUpdate(targetEvent._id, {
        $inc: { welcome_count: 1 }
      });
    }

    res.status(201).json({ message: 'Welcome sent' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Already welcomed this user for this event' });
    }
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

