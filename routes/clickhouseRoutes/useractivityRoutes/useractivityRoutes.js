const express = require('express');
const router = express.Router();
const { controller } = require("../../../controllers");

router.post('/user_data', controller.userdata);
router.post('/user_events', controller.userevents);
router.post('/user_Activity', controller.useractivity);

exports.userRoutes = router;