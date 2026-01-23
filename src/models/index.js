const Event = require('./Event');
const AuditLog = require('./AuditLog');

Event.hasMany(AuditLog, { foreignKey: 'eventId', as: 'auditLogs' });
AuditLog.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

module.exports = { Event, AuditLog };