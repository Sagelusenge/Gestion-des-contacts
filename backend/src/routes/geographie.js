const express = require('express');
const geographieController = require('../controllers/geographie.controller');
const rbacMiddleware = require('../middleware/rbac');

const router = express.Router();

router.get('/postes', geographieController.getPostes);
router.get('/sections', geographieController.getSections);
router.get('/paroisses', geographieController.getParoisses);
router.post('/postes', rbacMiddleware(['SUPER_ADMIN']), geographieController.createPoste);
router.post('/sections', rbacMiddleware(['SUPER_ADMIN', 'PASTEUR_POSTE']), geographieController.createSection);
router.post('/paroisses', rbacMiddleware(['SUPER_ADMIN', 'PASTEUR_POSTE', 'PASTEUR_SECTIONNAIRE']), geographieController.createParoisse);

module.exports = router;
