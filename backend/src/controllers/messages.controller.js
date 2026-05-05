const Joi = require('joi');
const { Op } = require('sequelize');
const {
  Message,
  MessageRecipient,
  Pasteur,
  Poste,
  Section,
  Paroisse,
  User,
  AuditLog
} = require('../models');

const sendSchema = Joi.object({
  objet: Joi.string().min(3).max(255).required(),
  contenu: Joi.string().min(3).required(),
  audienceType: Joi.string().valid('TOUS', 'GRADE', 'RESPONSABILITE', 'POSTE', 'SECTION', 'PAROISSE', 'PASTEURS_SELECTIONNES').required(),
  audienceValeur: Joi.alternatives().try(Joi.string(), Joi.number(), Joi.array().items(Joi.number())).allow('', null),
  canal: Joi.string().valid('BOITE_INTERNE', 'SMS', 'WHATSAPP', 'MIXTE').default('BOITE_INTERNE'),
  priorite: Joi.string().valid('Normale', 'Haute', 'Urgente').default('Normale')
});

const buildAudienceWhere = (audienceType, audienceValeur, req) => {
  const where = { statut: 'Actif' };

  if (req.user?.role === 'ADMIN_POSTE' && req.user?.posteAssigneId) {
    where.posteId = req.user.posteAssigneId;
  }

  if (audienceType === 'GRADE') where.grade = audienceValeur;
  if (audienceType === 'RESPONSABILITE') where.responsabilite = audienceValeur;
  if (audienceType === 'POSTE') where.posteId = Number(audienceValeur);
  if (audienceType === 'SECTION') where.sectionId = Number(audienceValeur);
  if (audienceType === 'PAROISSE') where.paroisseId = Number(audienceValeur);
  if (audienceType === 'PASTEURS_SELECTIONNES') where.id = { [Op.in]: audienceValeur.map(Number) };

  return where;
};

exports.getAudiences = async (req, res, next) => {
  try {
    const scope = req.user?.role === 'ADMIN_POSTE' && req.user?.posteAssigneId
      ? { posteId: req.user.posteAssigneId }
      : {};

    const [postes, sections, paroisses] = await Promise.all([
      Poste.findAll({ where: scope.posteId ? { id: scope.posteId } : {}, attributes: ['id', 'nom', 'code'], order: [['nom', 'ASC']] }),
      Section.findAll({ where: scope, attributes: ['id', 'nom', 'code', 'posteId'], order: [['nom', 'ASC']] }),
      Paroisse.findAll({ where: scope, attributes: ['id', 'nom', 'code', 'posteId', 'sectionId'], order: [['nom', 'ASC']] })
    ]);

    const staticAudiences = [
      { type: 'TOUS', value: '', label: 'Tous les pasteurs actifs' },
      { type: 'GRADE', value: 'Révérend Pasteur', label: 'Révérends Pasteurs' },
      { type: 'GRADE', value: 'Pasteur', label: 'Pasteurs' },
      { type: 'GRADE', value: 'Pasteur Stagiaire', label: 'Pasteurs stagiaires' },
      { type: 'GRADE', value: 'Proposant', label: 'Proposants' },
      { type: 'RESPONSABILITE', value: 'Pasteur de Poste', label: 'Pasteurs de poste' },
      { type: 'RESPONSABILITE', value: 'Pasteur Sectionnaire', label: 'Pasteurs sectionnaires' },
      { type: 'RESPONSABILITE', value: 'Pasteur de Paroisse', label: 'Pasteurs de paroisse' }
    ];

    const audiences = await Promise.all(
      staticAudiences.map(async (audience) => ({
        ...audience,
        count: await Pasteur.count({ where: buildAudienceWhere(audience.type, audience.value, req) })
      }))
    );

    res.json({
      success: true,
      data: { audiences, postes, sections, paroisses }
    });
  } catch (error) {
    next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { error, value } = sendSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
      });
    }

    const recipients = await Pasteur.findAll({
      where: buildAudienceWhere(value.audienceType, value.audienceValeur, req),
      attributes: ['id', 'nom', 'prenom', 'telephone', 'email']
    });

    if (!recipients.length) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_RECIPIENTS', message: 'Aucun destinataire trouvé pour cette cible' }
      });
    }

    const message = await Message.create({
      objet: value.objet,
      contenu: value.contenu,
      audienceType: value.audienceType,
      audienceValeur: Array.isArray(value.audienceValeur) ? value.audienceValeur.join(',') : String(value.audienceValeur || ''),
      canal: value.canal,
      priorite: value.priorite,
      sentById: req.user.id
    });

    await MessageRecipient.bulkCreate(
      recipients.map((pasteur) => ({
        messageId: message.id,
        pasteurId: pasteur.id,
        canalLivraison: value.canal
      }))
    );

    await AuditLog.create({
      action: 'CREATE',
      entite: 'Message',
      entiteId: message.id,
      utilisateurId: req.user.id,
      utilisateurNom: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email,
      nouvelles: {
        objet: message.objet,
        audienceType: message.audienceType,
        audienceValeur: message.audienceValeur,
        destinataires: recipients.length
      },
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      success: true,
      data: { message, destinataires: recipients.length, recipients }
    });
  } catch (error) {
    next(error);
  }
};

exports.listMessages = async (req, res, next) => {
  try {
    const messages = await Message.findAll({
      include: [
        { model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: MessageRecipient, attributes: ['id', 'pasteurId', 'statutLecture'] }
      ],
      order: [['sentAt', 'DESC']],
      limit: 80
    });

    res.json({ success: true, data: { messages } });
  } catch (error) {
    next(error);
  }
};

exports.getInbox = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.pasteurId) where.pasteurId = req.query.pasteurId;

    const inbox = await MessageRecipient.findAll({
      where,
      include: [
        { model: Message, include: [{ model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'email'] }] },
        { model: Pasteur, attributes: ['id', 'nom', 'prenom', 'matricule'] }
      ],
      order: [[Message, 'sentAt', 'DESC']]
    });

    res.json({ success: true, data: { inbox } });
  } catch (error) {
    next(error);
  }
};
