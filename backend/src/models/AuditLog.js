const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  action: {
    type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE'),
    allowNull: false
  },
  entite: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entiteId: {
    type: DataTypes.INTEGER
  },
  utilisateurId: {
    type: DataTypes.INTEGER,
    references: { model: 'Users', key: 'id' }
  },
  utilisateurNom: DataTypes.STRING,
  anciennes: DataTypes.JSON,
  nouvelles: DataTypes.JSON,
  ip: DataTypes.STRING,
  userAgent: DataTypes.STRING(500)
});

module.exports = AuditLog;
