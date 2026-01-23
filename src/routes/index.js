const express = require('express');
const router = express.Router();

const eventRoutes = require('./eventRoutes');
const authRoutes = require('./authRoutes');

router.use('/events', eventRoutes);
router.use('/auth', authRoutes);

// Placeholder for routes
router.get('/', (req, res) => {
  res.json({ message: 'Calendar Service API' });
});

module.exports = router;