const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const MessageRecipient = sequelize.define('MessageRecipient', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  messageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Messages', key: 'id' }
  },
  pasteurId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Pasteurs', key: 'id' }
  },
  statutLecture: {
    type: DataTypes.ENUM('Non lu', 'Lu', 'Archivé'),
    defaultValue: 'Non lu'
  },
  luAt: DataTypes.DATE,
  canalLivraison: {
    type: DataTypes.ENUM('BOITE_INTERNE', 'SMS', 'WHATSAPP', 'MIXTE'),
    defaultValue: 'WHATSAPP'
  }
});

module.exports = MessageRecipient;
