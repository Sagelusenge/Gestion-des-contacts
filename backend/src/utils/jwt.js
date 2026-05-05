const jwt = require('jsonwebtoken');
const config = require('../config');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      posteAssigneId: user.posteAssigneId
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expire }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpire }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken
};
