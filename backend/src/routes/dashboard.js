const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');

const router = express.Router();

router.get('/statistiques', dashboardController.getStatistiques);
router.get('/geographie', dashboardController.getGeographie);

module.exports = router;
