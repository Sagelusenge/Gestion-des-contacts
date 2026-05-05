const express = require('express');
const mouvementController = require('../controllers/mouvements.controller');
const rbacMiddleware = require('../middleware/rbac');

const router = express.Router();

router.get('/', mouvementController.listMouvements);
router.get('/alertes', mouvementController.getAlertes);
router.post('/', rbacMiddleware(['SUPER_ADMIN']), mouvementController.createMouvement);

module.exports = router;
