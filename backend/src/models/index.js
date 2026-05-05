const User = require('../models/User');
const Pasteur = require('../models/Pasteur');
const Poste = require('../models/Poste');
const Section = require('../models/Section');
const Paroisse = require('../models/Paroisse');
const Mouvement = require('../models/Mouvement');
const Communaute = require('../models/Communaute');
const AuditLog = require('../models/AuditLog');

let associationsReady = false;

const setupModels = () => {
  if (associationsReady) {
    return {
      User,
      Pasteur,
      Poste,
      Section,
      Paroisse,
      Mouvement,
      Communaute,
      AuditLog
    };
  }

    // Associations
    User.hasMany(Pasteur, { foreignKey: 'createdById' });
    Pasteur.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });

    Pasteur.belongsTo(Poste, { foreignKey: 'posteId' });
    Poste.hasMany(Pasteur, { foreignKey: 'posteId' });

    Pasteur.belongsTo(Section, { foreignKey: 'sectionId' });
    Section.hasMany(Pasteur, { foreignKey: 'sectionId' });

    Pasteur.belongsTo(Paroisse, { foreignKey: 'paroisseId' });
    Paroisse.hasMany(Pasteur, { foreignKey: 'paroisseId' });

    Poste.belongsTo(Communaute, { foreignKey: 'communauteId' });
    Communaute.hasMany(Poste, { foreignKey: 'communauteId' });

    Section.belongsTo(Poste, { foreignKey: 'posteId' });
    Poste.hasMany(Section, { foreignKey: 'posteId' });

    Paroisse.belongsTo(Section, { foreignKey: 'sectionId' });
    Section.hasMany(Paroisse, { foreignKey: 'sectionId' });

    Mouvement.belongsTo(Pasteur, { foreignKey: 'pasteurId' });
    Pasteur.hasMany(Mouvement, { foreignKey: 'pasteurId' });

    Mouvement.belongsTo(Poste, { foreignKey: 'posteCibleId', as: 'posteCible' });
    Mouvement.belongsTo(Poste, { foreignKey: 'posteSourceId', as: 'posteSource' });

    AuditLog.belongsTo(User, { foreignKey: 'utilisateurId', as: 'utilisateur' });

    associationsReady = true;

    return {
      User,
      Pasteur,
      Poste,
      Section,
      Paroisse,
      Mouvement,
      Communaute,
      AuditLog
    };
};

module.exports = {
  setupModels,
  User,
  Pasteur,
  Poste,
  Section,
  Paroisse,
  Mouvement,
  Communaute,
  AuditLog
};
