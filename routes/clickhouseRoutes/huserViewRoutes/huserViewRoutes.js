const express = require("express");
const { controller } = require("../../../controllers");

const router = express.Router();

// Active Users
router.post("/hactive-users", controller.hactiveUserscontroller);

// Views
router.post("/hviews", controller.hviewscontroller);

exports.huserViewRoutes = router;
