const { Mouvement, Pasteur, Poste } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');

const mouvementSchema = Joi.object({
  pasteurId: Joi.number().required(),
  dateDebut: Joi.date().required(),
  dateFin: Joi.date(),
  posteSourceId: Joi.number(),
  posteCibleId: Joi.number().required(),
  typeMovement: Joi.string().valid('Affectation', 'Transfert', 'Promotion', 'Retraite').required(),
  motif: Joi.string(),
  observations: Joi.string(),
  dureeMandat: Joi.number()
});

const pasteurScope = (req) => (
  req.user?.role === 'ADMIN_POSTE' && req.user?.posteAssigneId
    ? { posteId: req.user.posteAssigneId }
    : {}
);

exports.listMouvements = async (req, res, next) => {
  try {
    const { pasteur, statut, type } = req.query;
    const where = {};
    if (pasteur) where.pasteurId = pasteur;
    if (statut) where.statut = statut;
    if (type) where.typeMovement = type;

    const mouvements = await Mouvement.findAll({
      where,
      include: [
        { model: Pasteur, where: pasteurScope(req), required: true },
        { model: Poste, as: 'posteCible' },
        { model: Poste, as: 'posteSource' }
      ],
      order: [['dateDebut', 'DESC']]
    });

    res.json({ success: true, data: { mouvements } });
  } catch (error) {
    next(error);
  }
};

exports.createMouvement = async (req, res, next) => {
  try {
    const { error, value } = mouvementSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
      });
    }

    value.createdById = req.user.id;
    const mouvement = await Mouvement.create(value);

    res.status(201).json({ success: true, data: mouvement });
  } catch (error) {
    next(error);
  }
};

exports.getAlertes = async (req, res, next) => {
  try {
    const { moisAvant = 6 } = req.query;
    const dateLimit = new Date();
    dateLimit.setMonth(dateLimit.getMonth() + parseInt(moisAvant, 10));

    const alertes = await Mouvement.findAll({
      where: {
        dateFin: { [Op.between]: [new Date(), dateLimit] },
        statut: 'Effectué'
      },
      include: [
        { model: Pasteur, where: pasteurScope(req), required: true },
        { model: Poste, as: 'posteCible' }
      ],
      order: [['dateFin', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        alertes: alertes.map((mouvement) => ({
          id: mouvement.id,
          pasteur: `${mouvement.Pasteur.prenom} ${mouvement.Pasteur.nom}`,
          dateFinMandat: mouvement.dateFin,
          posteCourant: mouvement.posteCible?.nom,
          joursRestants: Math.ceil((mouvement.dateFin - new Date()) / (1000 * 60 * 60 * 24))
        })),
        total: alertes.length
      }
    });
  } catch (error) {
    next(error);
  }
};
