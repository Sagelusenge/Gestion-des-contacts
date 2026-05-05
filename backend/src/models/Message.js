const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  objet: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contenu: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  audienceType: {
    type: DataTypes.ENUM('TOUS', 'GRADE', 'RESPONSABILITE', 'POSTE', 'SECTION', 'PAROISSE', 'PASTEURS_SELECTIONNES'),
    allowNull: false
  },
  audienceValeur: DataTypes.STRING,
  canal: {
    type: DataTypes.ENUM('BOITE_INTERNE', 'SMS', 'WHATSAPP', 'MIXTE'),
    defaultValue: 'BOITE_INTERNE'
  },
  priorite: {
    type: DataTypes.ENUM('Normale', 'Haute', 'Urgente'),
    defaultValue: 'Normale'
  },
  statut: {
    type: DataTypes.ENUM('Brouillon', 'Envoyé', 'Annulé'),
    defaultValue: 'Envoyé'
  },
  sentById: {
    type: DataTypes.INTEGER,
    references: { model: 'Users', key: 'id' }
  },
  sentAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = Message;
