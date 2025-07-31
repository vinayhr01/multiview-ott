const express = require('express');
const router = express.Router();
const { controller } = require("../../../controllers");

// 1. Genre wise Completion
router.post('/genre-wise-completion', controller.getGenreWiseCompletion);

// 2. Content value wise
router.post('/content-value-wise', controller.getContentValueWise);

// 3. Top 10 movies
router.post('/top10-movies', controller.getTop10Movies);

// 4. Top 10 movies in duration
router.post('/top10-movies-duration', controller.getTop10MoviesDuration);

// 5. Top 10 shows
router.post('/top10-shows', controller.getTop10Shows);

// 6. Top 10 shows in duration
router.post('/top10-shows-duration', controller.getTop10ShowsDuration);

// 7. Content type wise consumption
router.post('/content-type-wise', controller.getContentTypeWiseConsumption);

// 8. Platform wise consumption
router.post('/platform-wise', controller.getPlatformWiseConsumption);

// 9. Page wise consumption
router.post('/page-wise', controller.getPageWiseConsumption);

exports.chartRoutes = router;
