const express = require('express');
const router = express.Router();

const startController = require('../controllers/startController');
const callbackController = require('../controllers/callbackController');
const resultController = require('../controllers/resultController');
const updateController = require('../controllers/updateController');
const { stopController } = require('../controllers/stopController');

router.post('/start', startController.startStream);
router.post('/stop', stopController.stopStream);
router.post('/callback', callbackController.receiveCallback);
router.get('/:service/result', resultController.getResult);
router.get('/updates/:jobId', updateController.getUpdates);

module.exports = router;
