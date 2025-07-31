const express = require("express");
const { controller } = require("../../../controllers");

const router = express.Router();

// Subs First Watch
router.post("/first-watch", controller.subsFirstWatchcontroller);

// Subs 24 Hours First Watch
router.post("/24hrs-first-watch", controller.subs24HrsFirstWatchcontroller);

exports.subsRoutes = router;
