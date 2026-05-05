const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Poste = sequelize.define('Poste', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  description: DataTypes.TEXT,
  communauteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Communautes', key: 'id' }
  },
  responsableId: {
    type: DataTypes.INTEGER,
    references: { model: 'Users', key: 'id' }
  },
  telephone: DataTypes.STRING,
  email: DataTypes.STRING,
  adresse: DataTypes.STRING,
  nombrePasteurs: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  nombreSections: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  nombreParoisses: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  createdById: {
    type: DataTypes.INTEGER,
    references: { model: 'Users', key: 'id' }
  }
});

module.exports = Poste;
