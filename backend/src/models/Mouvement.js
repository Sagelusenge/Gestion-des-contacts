const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Mouvement = sequelize.define('Mouvement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pasteurId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Pasteurs', key: 'id' }
  },
  dateDebut: {
    type: DataTypes.DATE,
    allowNull: false
  },
  dateFin: DataTypes.DATE,
  posteSourceId: {
    type: DataTypes.INTEGER,
    references: { model: 'Postes', key: 'id' }
  },
  posteCibleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Postes', key: 'id' }
  },
  typeMovement: {
    type: DataTypes.ENUM('Affectation', 'Transfert', 'Promotion', 'Retraite'),
    allowNull: false
  },
  motif: DataTypes.STRING,
  observations: DataTypes.TEXT,
  statut: {
    type: DataTypes.ENUM('Proposé', 'Approuvé', 'Effectué', 'Annulé'),
    defaultValue: 'Proposé'
  },
  dateApprobation: DataTypes.DATE,
  approuveeParId: {
    type: DataTypes.INTEGER,
    references: { model: 'Users', key: 'id' }
  },
  createdById: {
    type: DataTypes.INTEGER,
    references: { model: 'Users', key: 'id' }
  },
  alerteFin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  dureeMandat: DataTypes.INTEGER
});

module.exports = Mouvement;
