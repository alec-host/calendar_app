// src/models/AuditLog.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class AuditLog extends Model {}

AuditLog.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  eventId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  performedBy: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'AuditLog',
  tableName: 'audit_logs',
  timestamps: false,
  indexes: [
    { fields: ['tenantId'] },
    { fields: ['eventId'] },
  ],
});

module.exports = AuditLog;