const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Communaute = sequelize.define('Communaute', {
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
  pays: DataTypes.STRING,
  region: DataTypes.STRING,
  telephone: DataTypes.STRING,
  email: DataTypes.STRING,
  siteWeb: DataTypes.STRING,
  nombrePostes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  logo: DataTypes.STRING(500),
  couleur1: {
    type: DataTypes.STRING,
    defaultValue: '#1976d2'
  },
  couleur2: {
    type: DataTypes.STRING,
    defaultValue: '#dc004e'
  }
});

module.exports = Communaute;
