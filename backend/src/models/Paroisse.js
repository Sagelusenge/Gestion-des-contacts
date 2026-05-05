const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Paroisse = sequelize.define('Paroisse', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  description: DataTypes.TEXT,
  sectionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Sections', key: 'id' }
  },
  posteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Postes', key: 'id' }
  },
  pasteurId: {
    type: DataTypes.INTEGER,
    references: { model: 'Pasteurs', key: 'id' }
  },
  telephone: DataTypes.STRING,
  adresse: DataTypes.STRING,
  nombreMembers: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = Paroisse;
