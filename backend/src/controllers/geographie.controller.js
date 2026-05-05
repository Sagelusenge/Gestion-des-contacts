const { Poste, Section, Paroisse, Communaute } = require('../models');

exports.getPostes = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const offset = (page - 1) * limit;

    const where = search ? { nom: { [require('sequelize').Op.like]: `%${search}%` } } : {};

    const { count, rows } = await Poste.findAndCountAll({
      where,
      include: [{ model: Communaute }],
      offset,
      limit
    });

    res.json({
      success: true,
      data: {
        postes: rows,
        pagination: { page: parseInt(page), limit: parseInt(limit), total: count }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getSections = async (req, res, next) => {
  try {
    const { poste } = req.query;
    const where = poste ? { posteId: poste } : {};

    const sections = await Section.findAll({ where });

    res.json({
      success: true,
      data: { sections }
    });
  } catch (error) {
    next(error);
  }
};

exports.getParoisses = async (req, res, next) => {
  try {
    const { section } = req.query;
    const where = section ? { sectionId: section } : {};

    const paroisses = await Paroisse.findAll({
      where,
      include: [{ model: Section }, { model: Poste }]
    });

    res.json({
      success: true,
      data: { paroisses }
    });
  } catch (error) {
    next(error);
  }
};
