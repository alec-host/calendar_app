const moment = require('moment');

const { Op } = require('sequelize'); // Ensure Op is imported from sequelize
const { Event } = require('../models');

const { getTokens, getValidTokens } = require('../services/redisService');

const googleService = require('../services/googleCalendarService');

exports.createEvent = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    
    if (!tenantId) {
       console.error("Missing Tenant ID in request");
       return res.status(401).json({ error: 'Unauthorized: No Tenant ID' });
    }
	  
    const eventData = { ...req.body, tenantId, provider: 'google' };
    
    const googleToken = await getValidTokens(tenantId);

    if(!googleToken){
       return res.status(400).json({ error: 'No token found' });
    }	 

    const event = await Event.create(eventData);
    try{
        const gId = await googleService.syncLocalToGoogle(tenantId, event);
	if(gId){
	   await event.update({ providerEventId: gId });
	}    
    }catch(gErr){
	console.error('Google Sync Failed:', gErr.message);
    }	  
    res.status(201).json(event);
  }catch(error){
      console.error(error);
      res.status(500).json({ error: 'Failed to create event' });
  }
};

exports.getEvents = async (req, res) => {
  try {	  
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];

    if (!tenantId) {
        console.error("Missing Tenant ID in request");
        return res.status(401).json({ error: 'Unauthorized: No Tenant ID' });
    }

    const events = await Event.findAll({ where: { tenantId } });	  
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    const { event_id } = req.params;

    if (!tenantId) {
       console.error("Missing Tenant ID in request");
       return res.status(401).json({ error: 'Unauthorized: No Tenant ID' });
    }

    const event = await Event.findOne({ where: { id: event_id, tenantId } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

exports.checkConflicts = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];

    if (!tenantId) {
        console.error("Missing Tenant ID in request");
	return res.status(401).json({ error: 'Unauthorized: No Tenant ID' });
    }

    const { startTime, endTime } = req.query; 

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
	return res.status(400).json({ error: 'Invalid date format provided' });
    }

    const conflicts = await Event.findAll({
      where: {
        tenantId,
        startTime: { [Op.lt]: end },
        endTime: { [Op.gt]: start }
      }
    });

    res.json({
      hasConflict: conflicts.length > 0,
      conflicts: conflicts
    });
  } catch (error) {
    console.error('Conflict Check Error:', error);
    res.status(500).json({ error: 'Failed to check conflicts' });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    const { event_id } = req.params;

    const googleToken = await getValidTokens(tenantId);

    if(!googleToken){
       return res.status(400).json({ error: 'No token found' });
    }
	  
    const event = await Event.findOne({ where: { id:  event_id, tenantId } });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    await event.update(req.body);

    // Sync update to Google	  
    if(event.providerEventId) {
       await googleService.syncLocalToGoogle(tenantId, event, event.providerEventId);
    }

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];

    const { event_id } = req.params;

    const googleToken = await getValidTokens(tenantId);

    if(!googleToken){
       return res.status(400).json({ error: 'No token found' });
    }
	  
    const event = await Event.findOne({ where: { id: event_id, tenantId } });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Delete Google event first (or concurrently)
    if(event.google_event_id) {
       await googleService.deleteGoogleEvent(tenantId, event.google_event_id);
    }
	  
    await event.destroy();
    res.json({ message: 'Event deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

exports.syncAllEvents = async (req, res) => {
   try {
     const tenantId = req.user?.tenantId || req.headers['x-tenant-id']; // Derived from your auth middleware

     const channel = await connectRabbitMQ();
     
     if (!channel) {
	 return res.status(500).json({ error: 'Messaging service unavailable' });
     }

     const payload = {
         action: 'FULL_SYNC',
	 tenantId: tenantId
     };

     channel.sendToQueue('calendar_sync', Buffer.from(JSON.stringify(payload)), {
         persistent: true
     });

     res.json({ 
	 success: true, 
         message: 'Syncing your Google Calendar in the background. Please refresh in a moment.' 
     });
    } catch (error) {
	 console.error('Sync Error:', error);
	 res.status(500).json({ error: 'Failed to initiate sync' });
    }
};

exports.disconnectGoogle = async (req, res) => {
   const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];

   const channel = await connectRabbitMQ();

   // Send the revoke command to the worker
   channel.sendToQueue('calendar_sync', Buffer.from(JSON.stringify({
      action: 'REVOKE',
      tenantId: tenantId
   })), { persistent: true });

   res.json({ success: true, message: 'Disconnection initiated.' });
};
