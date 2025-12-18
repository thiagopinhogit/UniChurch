const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const Event = require('../models/Event');
const User = require('../models/User');

// Get all groups by church
router.get('/church/:church_id', async (req, res) => {
  try {
    const { type } = req.query;
    
    const filter = {
      church_id: req.params.church_id,
      is_active: true
    };

    if (type && type !== 'ALL') {
      filter.type = type;
    }

    const groups = await Group.find(filter).lean();

    // Get member count for each group
    for (let group of groups) {
      const memberCount = await GroupMember.countDocuments({ group_id: group._id });
      group.member_count = memberCount;
    }

    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get group details with members
router.get('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).lean();
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Get members
    const members = await GroupMember.find({ group_id: group._id })
      .populate('user_id', 'name photo_url')
      .limit(20)
      .lean();

    group.members = members.map(m => m.user_id);
    group.member_count = await GroupMember.countDocuments({ group_id: group._id });

    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create group
router.post('/', async (req, res) => {
  try {
    const group = new Group(req.body);
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Join group
router.post('/:id/join', async (req, res) => {
  try {
    const { user_id } = req.body;
    
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if already a member
    const existingMember = await GroupMember.findOne({
      group_id: req.params.id,
      user_id
    });

    if (existingMember) {
      return res.status(400).json({ error: 'Already a member of this group' });
    }

    // Add to group
    const groupMember = new GroupMember({
      group_id: req.params.id,
      user_id
    });
    await groupMember.save();

    // Check if first group/cell join
    const userGroupCount = await GroupMember.countDocuments({ user_id });
    
    let eventType = 'JOIN_GROUP';
    if (userGroupCount === 1) {
      eventType = 'JOIN_GROUP_FIRST_TIME';
    }
    
    if (group.type === 'CELL') {
      // Update user's cell
      await User.findByIdAndUpdate(user_id, { cell_id: req.params.id });
      
      // Check if first cell
      const userCellHistory = await GroupMember.find({ user_id })
        .populate('group_id')
        .lean();
      
      const cellCount = userCellHistory.filter(gm => gm.group_id.type === 'CELL').length;
      if (cellCount === 1) {
        eventType = 'FIRST_CELL';
      }
    }

    // Create event for mural
    const event = new Event({
      church_id: group.church_id,
      user_id,
      type: eventType,
      group_id: req.params.id
    });
    await event.save();

    res.status(201).json({ message: 'Joined group successfully', event });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Leave group
router.post('/:id/leave', async (req, res) => {
  try {
    const { user_id } = req.body;
    
    const result = await GroupMember.deleteOne({
      group_id: req.params.id,
      user_id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Not a member of this group' });
    }

    // If it was a cell, remove from user
    const group = await Group.findById(req.params.id);
    if (group.type === 'CELL') {
      await User.findByIdAndUpdate(user_id, { $unset: { cell_id: 1 } });
    }

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Request to join private group
router.post('/:id/request-join', async (req, res) => {
  try {
    const { user_id } = req.body;
    
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (!group.is_private) {
      return res.status(400).json({ error: 'This group is not private' });
    }

    // Check if already requested
    if (group.pending_requests.includes(user_id)) {
      return res.status(400).json({ error: 'Request already pending' });
    }

    // Check if already a member
    const existingMember = await GroupMember.findOne({
      group_id: req.params.id,
      user_id
    });

    if (existingMember) {
      return res.status(400).json({ error: 'Already a member of this group' });
    }

    // Add to pending requests
    group.pending_requests.push(user_id);
    await group.save();

    res.json({ message: 'Request sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending join requests (for admins)
router.get('/:id/pending-requests', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('pending_requests', 'name photo_url')
      .lean();
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json(group.pending_requests || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve join request
router.post('/:id/approve-request', async (req, res) => {
  try {
    const { user_id } = req.body;
    
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Remove from pending requests
    group.pending_requests = group.pending_requests.filter(
      id => id.toString() !== user_id
    );
    await group.save();

    // Add to group
    const groupMember = new GroupMember({
      group_id: req.params.id,
      user_id
    });
    await groupMember.save();

    // Check if first group/cell join
    const userGroupCount = await GroupMember.countDocuments({ user_id });
    
    let eventType = 'JOIN_GROUP';
    if (userGroupCount === 1) {
      eventType = 'JOIN_GROUP_FIRST_TIME';
    }
    
    if (group.type === 'CELL') {
      // Update user's cell
      await User.findByIdAndUpdate(user_id, { cell_id: req.params.id });
      
      // Check if first cell
      const userCellHistory = await GroupMember.find({ user_id })
        .populate('group_id')
        .lean();
      
      const cellCount = userCellHistory.filter(gm => gm.group_id.type === 'CELL').length;
      if (cellCount === 1) {
        eventType = 'FIRST_CELL';
      }
    }

    // Create event for mural
    const event = new Event({
      church_id: group.church_id,
      user_id,
      type: eventType,
      group_id: req.params.id
    });
    await event.save();

    res.json({ message: 'Request approved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject join request
router.post('/:id/reject-request', async (req, res) => {
  try {
    const { user_id } = req.body;
    
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Remove from pending requests
    group.pending_requests = group.pending_requests.filter(
      id => id.toString() !== user_id
    );
    await group.save();

    res.json({ message: 'Request rejected successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle group admin status
router.patch('/:id/toggle-admin', async (req, res) => {
  try {
    const { user_id } = req.body;
    
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is already admin
    const isAdmin = group.admins.some(adminId => adminId.toString() === user_id);

    if (isAdmin) {
      // Remove from admins
      group.admins = group.admins.filter(adminId => adminId.toString() !== user_id);
    } else {
      // Add to admins
      group.admins.push(user_id);
    }

    await group.save();

    res.json({ 
      success: true, 
      is_admin: !isAdmin,
      group 
    });
  } catch (error) {
    console.error('Toggle group admin error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update group
router.put('/:id', async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete group
router.delete('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Soft delete
    group.is_active = false;
    await group.save();

    // Remove all members
    await GroupMember.deleteMany({ group_id: req.params.id });

    // If it was a cell, remove from users
    if (group.type === 'CELL') {
      await User.updateMany(
        { cell_id: req.params.id },
        { $unset: { cell_id: 1 } }
      );
    }

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

