const express = require('express');
const router = express.Router();

const startController = require('../controllers/startController');
const callbackController = require('../controllers/callbackController');
const resultController = require('../controllers/resultController');

router.post('/start', startController.startStream);
router.post('/callback', callbackController.receiveCallback);
router.get('/:service/result', resultController.getResult);

module.exports = router;
