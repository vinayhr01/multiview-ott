const express = require('express');
const router = express.Router();
const { controller } = require("../../../controllers");

router.post('/active/:period', (req, res, next) => {
  /*
    #swagger.path = '/activity/active/{period}'
    #swagger.method = 'post'
    #swagger.parameters['period'] = {
        in: 'path',
        description: 'Period (30m, 1h, 6h, or blank or [space] for default)',
        required: true,
        type: 'string',
        enum: ['30m', '1h', '6h', ' ']
    }
  */
  return controller.activityController(req, res, next);
});


exports.activityRoutes = router;