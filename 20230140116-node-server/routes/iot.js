const express = require('express');
const router = express.Router();
const iotController = require('../controllers/iotController');

router.post('/ping', iotController.testConnection);

router.get('/history', iotController.getSensorHistory);
router.post('/data', iotController.receiveSensorData);

module.exports = router;