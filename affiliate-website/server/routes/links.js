const express = require('express');
const router = express.Router();
const AffiliateLink = require('../models/AffiliateLink');
const auth = require('../middleware/auth');

// Get all active links (public)
router.get('/', async (req, res) => {
  try {
    const links = await AffiliateLink.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin routes
router.use(auth);

// Create new link
router.post('/', async (req, res) => {
  try {
    const link = new AffiliateLink(req.body);
    await link.save();
    res.status(201).json(link);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update link
router.put('/:id', async (req, res) => {
  try {
    const link = await AffiliateLink.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(link);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete link
router.delete('/:id', async (req, res) => {
  try {
    await AffiliateLink.findByIdAndDelete(req.params.id);
    res.json({ message: 'Link deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all links (admin view)
router.get('/admin/all', async (req, res) => {
  try {
    const links = await AffiliateLink.find().sort({ order: 1 });
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
