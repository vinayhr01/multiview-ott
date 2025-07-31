const express = require("express");
const { controller } = require("../../../controllers");

const router = express.Router();

// Duration in mins
router.post("/in-mins", controller.durationInMinscontroller);

// Duration per viewer in mins
router.post("/per-viewer", controller.durationPerViewercontroller);

exports.durationRoutes = router;
