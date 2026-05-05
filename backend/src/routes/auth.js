const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth');
const rbacMiddleware = require('../middleware/rbac');

const router = express.Router();

router.post('/register', authMiddleware, rbacMiddleware(['SUPER_ADMIN']), authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);

module.exports = router;
