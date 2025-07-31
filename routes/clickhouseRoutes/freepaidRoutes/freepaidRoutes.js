const express = require('express');
const router = express.Router();
const { controller } = require("../../../controllers");

router.post('/overall-paid', controller.overallPaidController);
router.post('/paid-user-min', controller.paidUserMinController);
router.post('/overall-free', controller.overallFreeController);
router.post('/free-user-min', controller.freeUserMinController);

exports.freepaidRoutes = router;