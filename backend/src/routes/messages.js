const express = require('express');
const messagesController = require('../controllers/messages.controller');
const rbacMiddleware = require('../middleware/rbac');

const router = express.Router();

router.get('/audiences', messagesController.getAudiences);
router.get('/', messagesController.listMessages);
router.get('/inbox', messagesController.getInbox);
router.post('/', rbacMiddleware(['SUPER_ADMIN', 'PASTEUR_POSTE', 'PASTEUR_SECTIONNAIRE']), messagesController.sendMessage);

module.exports = router;
