const express = require('express');
const router = express.Router();
const { controller } = require("../../../controllers");

router.post('/top_contents', controller.getTopContents);
router.post('/top_country', controller.getTopCountries);
router.post('/top_cities', controller.getTopCities);

exports.topcontentRoutes = router;