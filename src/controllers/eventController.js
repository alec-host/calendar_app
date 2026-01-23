const { Event } = require('../models');

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const eventData = { ...req.body, tenantId };
    const event = await Event.create(eventData);
    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

// Get all events for tenant
exports.getEvents = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const events = await Event.findAll({ where: { tenantId } });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// Get single event by ID
exports.getEventById = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;
    const event = await Event.findOne({ where: { id, tenantId } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

// Update event by ID
exports.updateEvent = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;
    const event = await Event.findOne({ where: { id, tenantId } });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    await event.update(req.body);
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

// Delete event by ID
exports.deleteEvent = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;
    const event = await Event.findOne({ where: { id, tenantId } });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    await event.destroy();
    res.json({ message: 'Event deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};