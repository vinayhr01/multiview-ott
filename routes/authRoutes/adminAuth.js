const express = require("express");
const { controller } = require("../../controllers");
const { middleware } = require("../../middlewares");

const router = express.Router();

router.post("/update_role", middleware.checkRole,controller.updateRoleController);

// router.post("/update_role", middleware.checkRole, controller.updateRoleController); // Update role

router.post("/get_role", middleware.checkRole, controller.getRoleController); // Get role

router.post("/list_users", middleware.checkRole, controller.listUsersController); // List users

exports.adminAuthRoutes = router;