const express = require("express");
const { controller } = require("../../../controllers");

const router = express.Router();

router.post("/dau", controller.dauController);

router.post("/mau", controller.mauController);

exports.dauMauRoutes = router;