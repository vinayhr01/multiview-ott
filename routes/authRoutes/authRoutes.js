const express = require("express");
const { middleware } = require("../../middlewares/index");
const { controller } = require("../../controllers/index");

const router = express.Router();
router.post("/login", middleware.loginMiddleware, controller.loginController);

router.post("/register", middleware.registerMiddleware, controller.registerController);


// ✅ Forgot Password flow
// router.post("/forgot-password/initiate", controller.forgotPasswordInitiateController);
// router.post("/forgot-password/verify-otp", controller.verifyOtpController);
// router.post("/forgot-password/update-password", controller.updatePasswordController);


// router.post("/forgot-password/initiate",controller.forgotPasswordInitiateController);

// router.post("/forgot-password/verify-otp", controller.verifyOtpController);

// router.post("/forgot-password/update-password", controller.updatePasswordController);




// refresh token
router.post("/refresh-token", middleware.verifyUserMiddleware, 
  /*
    #swagger.method = 'post'
    #swagger.description = 'Refreshes the access token using the refresh token.'
    #swagger.parameters['authorization'] = {
      in: 'header',
      description: 'JWT refresh token with Bearer prefix',
      required: true,
      type: 'string'
    }
  */
  controller.refreshTokenController);

exports.authRoutes = router;
