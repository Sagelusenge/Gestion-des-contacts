const Joi = require('joi');
const { Op } = require('sequelize');
const { Poste, Section, Paroisse, Communaute, AuditLog } = require('../models');

const posteSchema = Joi.object({
  nom: Joi.string().min(2).required(),
  code: Joi.string().min(2).max(20).required(),
  description: Joi.string().allow('', null),
  communauteId: Joi.number().allow(null),
  telephone: Joi.string().allow('', null),
  email: Joi.string().email().allow('', null),
  adresse: Joi.string().allow('', null)
});

const sectionSchema = Joi.object({
  nom: Joi.string().min(2).required(),
  code: Joi.string().min(2).max(20).required(),
  description: Joi.string().allow('', null),
  posteId: Joi.number().required(),
  telephone: Joi.string().allow('', null),
  adresse: Joi.string().allow('', null)
});

const paroisseSchema = Joi.object({
  nom: Joi.string().min(2).required(),
  code: Joi.string().min(2).max(20).required(),
  description: Joi.string().allow('', null),
  sectionId: Joi.number().required(),
  posteId: Joi.number().required(),
  telephone: Joi.string().allow('', null),
  adresse: Joi.string().allow('', null)
});

const scopedPosteWhere = (req) => (
  (req.user?.role === 'PASTEUR_POSTE' || req.user?.role === 'PASTEUR_SECTIONNAIRE') && req.user?.posteAssigneId
    ? { id: req.user.posteAssigneId }
    : {}
);

const scopedGeoWhere = (req) => (
  (req.user?.role === 'PASTEUR_POSTE' || req.user?.role === 'PASTEUR_SECTIONNAIRE') && req.user?.posteAssigneId
    ? { posteId: req.user.posteAssigneId }
    : {}
);

const codeOf = (value) => value.trim().toUpperCase();

const writeAudit = async (req, entite, row) => {
  await AuditLog.create({
    action: 'CREATE',
    entite,
    entiteId: row.id,
    utilisateurId: req.user.id,
    utilisateurNom: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email,
    nouvelles: row.toJSON(),
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
};

exports.getPostes = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const offset = (page - 1) * limit;
    const where = { ...scopedPosteWhere(req) };

    if (search) {
      where.nom = { [Op.like]: `%${search}%` };
    }

    const { count, rows } = await Poste.findAndCountAll({
      where,
      include: [{ model: Communaute }],
      offset: Number(offset),
      limit: Number(limit),
      order: [['nom', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        postes: rows,
        pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total: count }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getSections = async (req, res, next) => {
  try {
    const { poste } = req.query;
    const where = { ...scopedGeoWhere(req) };

    if (poste && req.user.role === 'SUPER_ADMIN') {
      where.posteId = poste;
    }

    const sections = await Section.findAll({
      where,
      include: [{ model: Poste, attributes: ['id', 'nom', 'code'] }],
      order: [['nom', 'ASC']]
    });

    res.json({ success: true, data: { sections } });
  } catch (error) {
    next(error);
  }
};

exports.getParoisses = async (req, res, next) => {
  try {
    const { section } = req.query;
    const where = { ...scopedGeoWhere(req) };

    if (section) {
      where.sectionId = section;
    }

    const paroisses = await Paroisse.findAll({
      where,
      include: [{ model: Section }, { model: Poste }],
      order: [['nom', 'ASC']]
    });

    res.json({ success: true, data: { paroisses } });
  } catch (error) {
    next(error);
  }
};

exports.createPoste = async (req, res, next) => {
  try {
    const { error, value } = posteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.details[0].message } });
    }

    const communaute = value.communauteId
      ? await Communaute.findByPk(value.communauteId)
      : await Communaute.findOne({ order: [['id', 'ASC']] });

    if (!communaute) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Aucune communauté disponible pour rattacher ce poste' } });
    }

    const code = codeOf(value.code);
    const exists = await Poste.findOne({ where: { code } });
    if (exists) {
      return res.status(409).json({ success: false, error: { code: 'DUPLICATE_ENTRY', message: 'Ce code de poste existe déjà' } });
    }

    const poste = await Poste.create({
      ...value,
      code,
      communauteId: communaute.id,
      createdById: req.user.id
    });
    await writeAudit(req, 'Poste', poste);

    res.status(201).json({ success: true, data: poste });
  } catch (error) {
    next(error);
  }
};

exports.createSection = async (req, res, next) => {
  try {
    const { error, value } = sectionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.details[0].message } });
    }

    if (req.user.role === 'PASTEUR_POSTE' || req.user.role === 'PASTEUR_SECTIONNAIRE') {
      if (!req.user.posteAssigneId) {
        return res.status(403).json({ success: false, error: { code: 'AUTH_FORBIDDEN', message: 'Aucun poste n’est attaché à ce compte' } });
      }
      value.posteId = req.user.posteAssigneId;
    }

    const poste = await Poste.findByPk(value.posteId);
    if (!poste) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Poste introuvable' } });
    }

    const code = codeOf(value.code);
    const exists = await Section.findOne({ where: { code } });
    if (exists) {
      return res.status(409).json({ success: false, error: { code: 'DUPLICATE_ENTRY', message: 'Ce code de section existe déjà' } });
    }

    const section = await Section.create({ ...value, code });
    await writeAudit(req, 'Section', section);

    res.status(201).json({ success: true, data: section });
  } catch (error) {
    next(error);
  }
};

exports.createParoisse = async (req, res, next) => {
  try {
    const { error, value } = paroisseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.details[0].message } });
    }

    if (req.user.role === 'PASTEUR_POSTE' || req.user.role === 'PASTEUR_SECTIONNAIRE') {
      if (!req.user.posteAssigneId) {
        return res.status(403).json({ success: false, error: { code: 'AUTH_FORBIDDEN', message: 'Aucun poste n’est attaché à ce compte' } });
      }
      value.posteId = req.user.posteAssigneId;
    }

    const section = await Section.findOne({ where: { id: value.sectionId, posteId: value.posteId } });
    if (!section) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'La section choisie ne correspond pas au poste autorisé' } });
    }

    const code = codeOf(value.code);
    const exists = await Paroisse.findOne({ where: { code } });
    if (exists) {
      return res.status(409).json({ success: false, error: { code: 'DUPLICATE_ENTRY', message: 'Ce code de paroisse existe déjà' } });
    }

    const paroisse = await Paroisse.create({ ...value, code, nombreMembers: 0 });
    await writeAudit(req, 'Paroisse', paroisse);

    res.status(201).json({ success: true, data: paroisse });
  } catch (error) {
    next(error);
  }
};
