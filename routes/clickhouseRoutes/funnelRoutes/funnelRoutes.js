const express = require('express');
const router = express.Router();
const { controller } = require("../../../controllers");

// 🔁 Funnel Management
router.post("/add_funnels", controller.addFunnelController);
router.post("/get_funnels", controller.getFunnelsController);
router.post("/get_funnels_id", controller.getFunnelByIdController);

router.post("/update_funnels_id", controller.updateFunnelController);
router.post("/delete_funnels_id", controller.deleteFunnelController);

router.post("/count_funnels_id", controller.countFunnelsController); 
router.post("/get_count_funnels", controller.getCountFunnelsController); 

//  Drop-off Analysis
router.post("/dropoffs_funnels_id", controller.dropoffUsersController);
router.post("/non_dropoffs_funnels_id", controller.nonDropoffUsersController);

router.post("/get_dropoffs_funnels", controller.getDropoffUsersController);
router.post("/get_non_dropoffs_funnels", controller.getNonDropoffUsersController);

router.post("/get_event_names", controller.getEventNamesController); 
router.post("/get_column_names", controller.getColumnNamesController); 

exports.funnelRoutes = router;