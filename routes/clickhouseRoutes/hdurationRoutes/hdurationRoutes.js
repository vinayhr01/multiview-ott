const express = require("express");
const { controller } = require("../../../controllers");

const router = express.Router();

// Duration in mins
router.post("/hin-mins", controller.hdurationInMinscontroller);

// Duration per viewer in mins
router.post("/hper-viewer", controller.hdurationPerViewercontroller);

exports.hdurationRoutes = router;
