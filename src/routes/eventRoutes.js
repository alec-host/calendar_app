const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const eventController = require('../controllers/eventController');

//router.use(auth);

router.post('/', eventController.createEvent);
router.get('/', eventController.getEvents);
//router.get('/:event_id', eventController.getEventById);
router.get('/check-conflicts', eventController.checkConflicts);
router.patch('/:event_id', eventController.updateEvent);
router.delete('/:event_id', eventController.deleteEvent);
router.post('/sync-google', eventController.syncAllEvents);

module.exports = router;
