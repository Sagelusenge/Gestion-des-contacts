const { AuditLog, User } = require('../models');

exports.listAuditLogs = async (req, res, next) => {
  try {
    const { entite, action, limit = 50 } = req.query;
    const where = {};

    if (entite) where.entite = entite;
    if (action) where.action = action;

    const logs = await AuditLog.findAll({
      where,
      include: [{ model: User, as: 'utilisateur', attributes: ['id', 'firstName', 'lastName', 'email', 'role'] }],
      order: [['createdAt', 'DESC']],
      limit: Number(limit)
    });

    res.json({
      success: true,
      data: { logs }
    });
  } catch (error) {
    next(error);
  }
};
