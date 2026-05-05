const { Pasteur, Poste, Section, Paroisse, User, Mouvement, AuditLog } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');

const pasteurSchema = Joi.object({
  nom: Joi.string().required(),
  prenom: Joi.string().required(),
  dateNaissance: Joi.date(),
  lieuNaissance: Joi.string().allow('', null),
  photo: Joi.string().allow('', null),
  email: Joi.string().email().allow('', null),
  telephone: Joi.string().allow('', null),
  matricule: Joi.string().required(),
  numeroIdentifiant: Joi.string().allow('', null),
  dateOrdination: Joi.date().required(),
  grade: Joi.string().valid('Révérend Pasteur', 'Pasteur', 'Pasteur Stagiaire', 'Proposant').required(),
  responsabilite: Joi.string().valid('Pasteur de Poste', 'Pasteur Sectionnaire', 'Pasteur de Paroisse', 'Assistant Pastoral', 'Administration'),
  fonction: Joi.string().allow('', null),
  formation: Joi.array().items(Joi.object()).default([]),
  etatCivil: Joi.string().valid('Célibataire', 'Marié', 'Divorcé', 'Veuf').allow(null),
  conjoint: Joi.object().allow(null),
  enfants: Joi.array().items(Joi.object()).default([]),
  posteId: Joi.number().required(),
  sectionId: Joi.number().allow(null),
  paroisseId: Joi.number().allow(null),
  adresseActuelle: Joi.string().allow('', null),
  statut: Joi.string().valid('Actif', 'En Congé', 'Retraité', 'Suspendu'),
  notes: Joi.string().allow('', null),
  alerteFin: Joi.boolean()
});

const getPasteurScope = (req) => (
  req.user?.role === 'ADMIN_POSTE' && req.user?.posteAssigneId
    ? { posteId: req.user.posteAssigneId }
    : {}
);

const writeAudit = async (req, action, pasteur, anciennes = null) => {
  await AuditLog.create({
    action,
    entite: 'Pasteur',
    entiteId: pasteur.id,
    utilisateurId: req.user.id,
    utilisateurNom: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email,
    anciennes,
    nouvelles: pasteur.toJSON(),
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
};

exports.listPasteurs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, poste, statut, grade, responsabilite, search } = req.query;
    const offset = (page - 1) * limit;

    let where = getPasteurScope(req);
    if (poste) where.posteId = poste;
    if (statut) where.statut = statut;
    if (grade) where.grade = grade;
    if (responsabilite) where.responsabilite = responsabilite;
    if (search) {
      where = {
        ...where,
        [Op.or]: [
          { nom: { [Op.like]: `%${search}%` } },
          { prenom: { [Op.like]: `%${search}%` } },
          { matricule: { [Op.like]: `%${search}%` } },
          { fonction: { [Op.like]: `%${search}%` } },
          { responsabilite: { [Op.like]: `%${search}%` } }
        ]
      };
    }

    const { count, rows } = await Pasteur.findAndCountAll({
      where,
      include: [
        { model: Poste, attributes: ['id', 'nom', 'code'] },
        { model: Section, attributes: ['id', 'nom', 'code'] },
        { model: Paroisse, attributes: ['id', 'nom', 'code'] }
      ],
      offset: Number(offset),
      limit: Number(limit),
      order: [['nom', 'ASC'], ['prenom', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        pasteurs: rows,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getPasteur = async (req, res, next) => {
  try {
    const pasteur = await Pasteur.findOne({
      where: { id: req.params.id, ...getPasteurScope(req) },
      include: [
        { model: Poste },
        { model: Section },
        { model: Paroisse },
        { model: User, as: 'createdBy', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Mouvement, include: [{ model: Poste, as: 'posteCible' }, { model: Poste, as: 'posteSource' }] }
      ]
    });

    if (!pasteur) {
      return res.status(404).json({
        success: false,
        error: { code: 'RESOURCE_NOT_FOUND', message: 'Pasteur non trouvé' }
      });
    }

    res.json({ success: true, data: pasteur });
  } catch (error) {
    next(error);
  }
};

exports.createPasteur = async (req, res, next) => {
  try {
    const { error, value } = pasteurSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
      });
    }

    if (req.user.role === 'ADMIN_POSTE') {
      value.posteId = req.user.posteAssigneId;
    }

    const exists = await Pasteur.findOne({ where: { matricule: value.matricule } });
    if (exists) {
      return res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE_ENTRY', message: 'Matricule déjà utilisé' }
      });
    }

    value.createdById = req.user.id;
    const pasteur = await Pasteur.create(value);
    await writeAudit(req, 'CREATE', pasteur);

    res.status(201).json({ success: true, data: pasteur });
  } catch (error) {
    next(error);
  }
};

exports.updatePasteur = async (req, res, next) => {
  try {
    const pasteur = await Pasteur.findOne({ where: { id: req.params.id, ...getPasteurScope(req) } });
    if (!pasteur) {
      return res.status(404).json({
        success: false,
        error: { code: 'RESOURCE_NOT_FOUND', message: 'Pasteur non trouvé' }
      });
    }

    const anciennes = pasteur.toJSON();
    req.body.updatedById = req.user.id;
    if (req.user.role === 'ADMIN_POSTE') {
      delete req.body.posteId;
    }

    await pasteur.update(req.body);
    await writeAudit(req, 'UPDATE', pasteur, anciennes);

    res.json({ success: true, data: pasteur });
  } catch (error) {
    next(error);
  }
};

exports.deletePasteur = async (req, res, next) => {
  try {
    const pasteur = await Pasteur.findByPk(req.params.id);
    if (!pasteur) {
      return res.status(404).json({
        success: false,
        error: { code: 'RESOURCE_NOT_FOUND', message: 'Pasteur non trouvé' }
      });
    }

    await writeAudit(req, 'DELETE', pasteur, pasteur.toJSON());
    await pasteur.destroy();

    res.json({ success: true, message: 'Pasteur supprimé avec succès' });
  } catch (error) {
    next(error);
  }
};
