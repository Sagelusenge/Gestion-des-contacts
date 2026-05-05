const express = require('express');
const geographieController = require('../controllers/geographie.controller');

const router = express.Router();

router.get('/postes', geographieController.getPostes);
router.get('/sections', geographieController.getSections);
router.get('/paroisses', geographieController.getParoisses);

module.exports = router;
