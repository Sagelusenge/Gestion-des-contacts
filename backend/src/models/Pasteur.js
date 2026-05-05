const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Pasteur = sequelize.define('Pasteur', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dateNaissance: DataTypes.DATE,
  lieuNaissance: DataTypes.STRING,
  photo: DataTypes.STRING(500),
  email: {
    type: DataTypes.STRING,
    validate: { isEmail: true }
  },
  telephone: DataTypes.STRING,
  matricule: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  numeroIdentifiant: DataTypes.STRING,
  dateOrdination: {
    type: DataTypes.DATE,
    allowNull: false
  },
  grade: {
    type: DataTypes.ENUM('Révérend Pasteur', 'Pasteur', 'Pasteur Stagiaire', 'Proposant'),
    allowNull: false
  },
  fonction: DataTypes.STRING,
  formation: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  etatCivil: {
    type: DataTypes.ENUM('Célibataire', 'Marié', 'Divorcé', 'Veuf')
  },
  conjoint: {
    type: DataTypes.JSON
  },
  enfants: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  posteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Postes', key: 'id' }
  },
  sectionId: {
    type: DataTypes.INTEGER,
    references: { model: 'Sections', key: 'id' }
  },
  paroisseId: {
    type: DataTypes.INTEGER,
    references: { model: 'Paroisses', key: 'id' }
  },
  adresseActuelle: DataTypes.STRING,
  statut: {
    type: DataTypes.ENUM('Actif', 'En Congé', 'Retraité', 'Suspendu'),
    defaultValue: 'Actif'
  },
  createdById: {
    type: DataTypes.INTEGER,
    references: { model: 'Users', key: 'id' }
  },
  updatedById: {
    type: DataTypes.INTEGER,
    references: { model: 'Users', key: 'id' }
  },
  notes: DataTypes.TEXT,
  alerteFin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Pasteur;
