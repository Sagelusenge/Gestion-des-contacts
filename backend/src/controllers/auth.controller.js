const { User } = require('../models');
const { generateToken, generateRefreshToken } = require('../utils/jwt');
const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

exports.register = async (req, res) => {
  res.status(403).json({
    success: false,
    error: {
      code: 'REGISTER_DISABLED',
      message: 'La création des comptes se fait uniquement par la hiérarchie autorisée.'
    }
  });
};

exports.login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
      });
    }

    const user = await User.findOne({ where: { email: value.email, isActive: true } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Identifiants invalides' }
      });
    }

    const isPasswordValid = await user.comparePassword(value.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Identifiants invalides' }
      });
    }

    await user.update({ lastLogin: new Date() });

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      data: {
        token,
        refreshToken,
        user: user.toJSON(),
        expiresIn: 86400
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Refresh token requis' }
      });
    }

    try {
      const { id } = require('jsonwebtoken').verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findByPk(id);
      if (!user || !user.isActive) {
        throw new Error('User not found');
      }

      const newToken = generateToken(user);
      res.json({
        success: true,
        data: { token: newToken, expiresIn: 86400 }
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: { code: 'AUTH_INVALID', message: 'Token invalide' }
      });
    }
  } catch (error) {
    next(error);
  }
};
