const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Section = sequelize.define('Section', {
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
  posteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Postes', key: 'id' }
  },
  responsableId: {
    type: DataTypes.INTEGER,
    references: { model: 'Pasteurs', key: 'id' }
  },
  telephone: DataTypes.STRING,
  adresse: DataTypes.STRING
});

module.exports = Section;
