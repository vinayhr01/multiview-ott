const express = require('express');
const router = express.Router();
const { controller } = require("../../../controllers");

router.post('/top_contents', controller.hgetTopContents);
router.post('/top_country', controller.hgetTopCountries);
router.post('/top_cities', controller.hgetTopCities);

exports.htopcontentRoutes = router;