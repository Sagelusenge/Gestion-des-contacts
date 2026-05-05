const User = require('../models/User');
const Pasteur = require('../models/Pasteur');
const Poste = require('../models/Poste');
const Section = require('../models/Section');
const Paroisse = require('../models/Paroisse');
const Mouvement = require('../models/Mouvement');
const Communaute = require('../models/Communaute');
const AuditLog = require('../models/AuditLog');
const Message = require('../models/Message');
const MessageRecipient = require('../models/MessageRecipient');

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
      AuditLog,
      Message,
      MessageRecipient
    };
  }

  User.hasMany(Pasteur, { foreignKey: 'createdById' });
  Pasteur.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });
  User.belongsTo(Pasteur, { foreignKey: 'pasteurId', as: 'pasteur', constraints: false });

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

  Message.belongsTo(User, { foreignKey: 'sentById', as: 'sender' });
  User.hasMany(Message, { foreignKey: 'sentById' });
  Message.hasMany(MessageRecipient, { foreignKey: 'messageId' });
  MessageRecipient.belongsTo(Message, { foreignKey: 'messageId' });
  MessageRecipient.belongsTo(Pasteur, { foreignKey: 'pasteurId' });
  Pasteur.hasMany(MessageRecipient, { foreignKey: 'pasteurId' });

  associationsReady = true;

  return {
    User,
    Pasteur,
    Poste,
    Section,
    Paroisse,
    Mouvement,
    Communaute,
    AuditLog,
    Message,
    MessageRecipient
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
  AuditLog,
  Message,
  MessageRecipient
};
