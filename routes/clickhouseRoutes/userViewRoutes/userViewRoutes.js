const express = require("express");
const { controller } = require("../../../controllers");

const router = express.Router();

// Active Users
router.post("/active-users", controller.activeUserscontroller);

// Views
router.post("/views", controller.viewscontroller);

exports.userViewRoutes = router;
