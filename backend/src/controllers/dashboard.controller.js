const { Pasteur, Poste, Section, Paroisse, Mouvement } = require('../models');
const { Op } = require('sequelize');

const grades = ['Révérend Pasteur', 'Pasteur', 'Pasteur Stagiaire', 'Proposant'];
const statuts = ['Actif', 'En Congé', 'Retraité', 'Suspendu'];

const getScopeWhere = (req) => {
  if (req.user?.role === 'ADMIN_POSTE' && req.user?.posteAssigneId) {
    return { posteId: req.user.posteAssigneId };
  }

  return {};
};

exports.getStatistiques = async (req, res, next) => {
  try {
    const pasteurScope = getScopeWhere(req);
    const totalPasteurs = await Pasteur.count({ where: pasteurScope });
    const totalPostes = req.user?.role === 'ADMIN_POSTE' ? 1 : await Poste.count();
    const totalSections = await Section.count({ where: pasteurScope.posteId ? { posteId: pasteurScope.posteId } : {} });
    const totalParoisses = await Paroisse.count({ where: pasteurScope.posteId ? { posteId: pasteurScope.posteId } : {} });

    const pasteurParGrade = {};
    for (const grade of grades) {
      pasteurParGrade[grade] = await Pasteur.count({ where: { ...pasteurScope, grade } });
    }

    const pasteurParStatut = {};
    for (const statut of statuts) {
      pasteurParStatut[statut] = await Pasteur.count({ where: { ...pasteurScope, statut } });
    }

    const dateLimit = new Date();
    dateLimit.setMonth(dateLimit.getMonth() + 6);
    const alertesMandats = await Mouvement.count({
      where: {
        dateFin: { [Op.between]: [new Date(), dateLimit] },
        statut: 'Effectué'
      },
      include: [{ model: Pasteur, where: pasteurScope, required: true }]
    });

    res.json({
      success: true,
      data: {
        totalPasteurs,
        pasteurParGrade,
        pasteurParStatut,
        totalPostes,
        totalSections,
        totalParoisses,
        alertesMandats
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getGeographie = async (req, res, next) => {
  try {
    const posteWhere = req.user?.role === 'ADMIN_POSTE' && req.user?.posteAssigneId
      ? { id: req.user.posteAssigneId }
      : {};

    const postes = await Poste.findAll({
      where: posteWhere,
      attributes: ['id', 'nom', 'code', 'telephone', 'email'],
      order: [['nom', 'ASC']]
    });

    const parPosition = await Promise.all(
      postes.map(async (poste) => ({
        id: poste.id,
        poste: poste.nom,
        code: poste.code,
        telephone: poste.telephone,
        email: poste.email,
        pasteurs: await Pasteur.count({ where: { posteId: poste.id } }),
        sections: await Section.count({ where: { posteId: poste.id } }),
        paroisses: await Paroisse.count({ where: { posteId: poste.id } })
      }))
    );

    res.json({
      success: true,
      data: { parPosition }
    });
  } catch (error) {
    next(error);
  }
};
