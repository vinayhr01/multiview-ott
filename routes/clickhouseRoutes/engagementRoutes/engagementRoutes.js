const express = require('express');
const router = express.Router();
const { controller } = require("../../../controllers");

router.post('/totalactiveusers', controller.totalActiveUsersController);
router.post('/total-views', controller.totalViewsController);
router.post('/total-watch-time', controller.totalWatchTimeController);

exports.engagementRoutes = router;