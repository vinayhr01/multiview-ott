// const express = require("express");
// const { controller } = require("../../../controllers");

// const router = express.Router();

// // ✅ Forgot Password flow
// router.post("/hsearch_filters/:filter_type", controller.hsearchController);

// exports.hsearchRoutes = router;

const express = require("express");
const { controller } = require("../../../controllers");

const router = express.Router();

router.post("/hsearch_filters/:filter_type", (req, res, next) => {
  /*
    #swagger.path = '/hist_search/hsearch_filters/{filter_type}'
    #swagger.method = 'post'
    #swagger.parameters['filter_type'] = {
        in: 'path',
        description: 'Type of filter to apply',
        required: true,
        type: 'string',
        enum: ['content_type', 'country', 'genre', 'platform', 'show_name', 'source', 'video_name']
    }
  */
  return controller.hsearchController(req, res, next);
});

exports.hsearchRoutes = router;
