const express = require('express');
const pasteurController = require('../controllers/pasteurs.controller');
const rbacMiddleware = require('../middleware/rbac');

const router = express.Router();

router.get('/', pasteurController.listPasteurs);
router.get('/:id', pasteurController.getPasteur);
router.post('/', rbacMiddleware(['SUPER_ADMIN', 'ADMIN_POSTE']), pasteurController.createPasteur);
router.put('/:id', rbacMiddleware(['SUPER_ADMIN', 'ADMIN_POSTE']), pasteurController.updatePasteur);
router.delete('/:id', rbacMiddleware(['SUPER_ADMIN']), pasteurController.deletePasteur);

module.exports = router;
