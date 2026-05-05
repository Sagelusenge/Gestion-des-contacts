const express = require('express');
const auditController = require('../controllers/audit.controller');
const rbacMiddleware = require('../middleware/rbac');

const router = express.Router();

router.get('/', rbacMiddleware(['SUPER_ADMIN']), auditController.listAuditLogs);

module.exports = router;
