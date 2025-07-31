// controllers/index.js
// Auth Controllers imports
const { loginController } = require("./authController/loginController");
const { registerController } = require("./authController/registerController");
const { forgotPasswordInitiateController } = require("./authController/forgotPasswordInitiateController");
const { verifyOtpController } = require("./authController/verifyOtpController");
const { updatePasswordController } = require("./authController/updatePasswordController");
const {updateRoleController, getRoleController, listUsersController} = require('../controllers/authController/adminAuthController');
// DAU Controllers imports
const { dauController } = require("./clickhouseController/dauController/dauController");
// MAU Controllers imports
const { mauController } = require("./clickhouseController/mauController/mauController");
// Refresh Token Controller import
const { refreshTokenController } = require("./authController/refreshTokenController");
// Chart Controllers imports
const { getGenreWiseCompletion } = require("./clickhouseController/chartController/genreWiseCompletion.controller");
const { getContentValueWise } = require("./clickhouseController/chartController/contentValueWise.controller");
const { getTop10Movies } = require("./clickhouseController/chartController/top10Movies.controller");
const { getTop10MoviesDuration } = require("./clickhouseController/chartController/top10MoviesDuration.controller");
const { getTop10Shows } = require("./clickhouseController/chartController/top10Shows.controller");
const { getTop10ShowsDuration } = require("./clickhouseController/chartController/top10ShowsDuration.controller");
const { getContentTypeWiseConsumption } = require("./clickhouseController/chartController/contentTypeWiseConsumption.controller");
const { getPlatformWiseConsumption } = require("./clickhouseController/chartController/platformWiseConsumption.controller");
const { getPageWiseConsumption } = require("./clickhouseController/chartController/pageWiseConsumption.controller");
// Top Content Controllers imports
const { getTopCities } = require("./clickhouseController/topcontentController/topCities.controller");
const { getTopContents } = require("./clickhouseController/topcontentController/topContents.controller");
const { getTopCountries } = require("./clickhouseController/topcontentController/topCountries.controller");
//metrics like sub, dur and userview
const { subs24HrsFirstWatchcontroller } = require("./clickhouseController/subsControllers/subs24HrsFirstWatchcontroller");
const { subsFirstWatchcontroller } = require("./clickhouseController/subsControllers/subsFirstWatchcontroller");
const { durationInMinscontroller } = require("./clickhouseController/durationControllers/durationInMinscontroller");
const { durationPerViewercontroller } = require("./clickhouseController/durationControllers/durationPerViewercontroller");
const { activeUserscontroller } = require("./clickhouseController/userViewControllers/activeUserscontroller");
const { viewscontroller } = require("./clickhouseController/userViewControllers/viewscontroller");
//search filter added
const { searchController } = require("./clickhouseController/searchController/searchController");
//engagement metrics added
const { totalViewsController } = require("./clickhouseController/engagementController/totalViewsController");
const { totalActiveUsersController } = require("./clickhouseController/engagementController/totalActiveUsersController");
const { totalWatchTimeController } = require("./clickhouseController/engagementController/totalWatchTimeController");
//free paid user data
const { freeUserMinController } = require("./clickhouseController/freePaidUserController/freeUserMinController");
const { overallFreeController } = require("./clickhouseController/freePaidUserController/overallFreeController");
const { overallPaidController } = require("./clickhouseController/freePaidUserController/overallPaidController");
const { paidUserMinController } = require("./clickhouseController/freePaidUserController/paidUserMinController");
//Activity Controoling
// const { activityController } = require("./clickhouseController/activityController/activityController");
// const { activeLast1HourController } = require("./clickhouseController/activityController/activeLast1HourController");
// const { activeLast6HoursController } = require("./clickhouseController/activityController/activeLast6HoursController");
// const { activeLast30MinController } = require("./clickhouseController/activityController/activeLast30MinController");
const { hdurationInMinscontroller } = require("./clickhouseController/hdurationControllers/hdurationInMinscontroller");
const { hdurationPerViewercontroller } = require("./clickhouseController/hdurationControllers/hdurationPerViewercontroller");
const { hsearchController } = require("./clickhouseController/hsearchController/hsearchController");
// const { hsubs24HrsFirstWatchcontroller } = require("./clickhouseController/hsubsControllers/hsubs24HrsFirstWatchcontroller");
// const { hsubsFirstWatchcontroller } = require("./clickhouseController/hsubsControllers/hsubsFirstWatchcontroller");
const { hgetTopCities } = require("./clickhouseController/htopcontentController/htopCities.controller");
const { hgetTopContents } = require("./clickhouseController/htopcontentController/htopContents.controller");
const { hgetTopCountries } = require("./clickhouseController/htopcontentController/htopCountries.controller");
const { hactiveUserscontroller } = require("./clickhouseController/huserViewControllers/hactiveUserscontroller");
const { hviewscontroller } = require("./clickhouseController/huserViewControllers/hviewscontroller");
const { activityController } = require("./clickhouseController/activityController/activityController");
//user activity data
const { userdata } = require("./clickhouseController/userActivityController/userdataController");
const { userevents } = require("./clickhouseController/userActivityController/usereventsController");
const { useractivity } = require("./clickhouseController/userActivityController/useractivityController");
//Funnels Controllers 
const { addFunnelController } = require("./clickhouseController/funnelControllers/addFunnelController");
const { countFunnelsController } = require("./clickhouseController/funnelControllers/countFunnelsController");
const { deleteFunnelController } = require("./clickhouseController/funnelControllers/deleteFunnelController");
const { dropoffUsersController } = require("./clickhouseController/funnelControllers/dropoffUsersController");
const { getColumnNamesController } = require("./clickhouseController/funnelControllers/getColumnNamesController");
const { getCountFunnelsController } = require("./clickhouseController/funnelControllers/getCountFunnelsController");
const { getDropoffUsersController } = require("./clickhouseController/funnelControllers/getDropoffUsersController");
const { getEventNamesController } = require("./clickhouseController/funnelControllers/getEventNamesController");
const { getFunnelByIdController } = require("./clickhouseController/funnelControllers/getFunnelByIdController");
const { getFunnelsController } = require("./clickhouseController/funnelControllers/getFunnelsController");
const { getNonDropoffUsersController } = require("./clickhouseController/funnelControllers/getNonDropoffUsersController");
const { nonDropoffUsersController } = require("./clickhouseController/funnelControllers/nonDropoffUsersController");
const { updateFunnelController } = require("./clickhouseController/funnelControllers/updateFunnelController");


exports.controller = {
  // Auth Controllers
  loginController,
  registerController,
  forgotPasswordInitiateController,
  verifyOtpController,
  updatePasswordController,
  refreshTokenController,
  updateRoleController,
  getRoleController,
  listUsersController,
  // DAU Controllers
  dauController,
  // MAU Controllers
  mauController,
  // Chart Controllers
  getGenreWiseCompletion,
  getContentValueWise,
  getTop10Movies,
  getTop10MoviesDuration,
  getTop10Shows,
  getTop10ShowsDuration,
  getContentTypeWiseConsumption,
  getPlatformWiseConsumption,
  getPageWiseConsumption,
  //top content controllers
  getTopContents,
  getTopCountries,
  getTopCities,
  //metrics like sub, dur, user
  subs24HrsFirstWatchcontroller,
  subsFirstWatchcontroller,
  durationInMinscontroller,
  durationPerViewercontroller,
  activeUserscontroller,
  viewscontroller,
  searchController,
  //engagement metrics
  totalViewsController,
  totalActiveUsersController,
  totalWatchTimeController,
  //free paid user data
  freeUserMinController,
  overallFreeController,
  overallPaidController,
  paidUserMinController,
  //activity
  activityController,
  // activeLast1HourController,
  // activeLast6HoursController,
  // activeLast30MinController,

  hdurationInMinscontroller,
  hdurationPerViewercontroller,

  hsearchController,

  // hsubs24HrsFirstWatchcontroller,
  // hsubsFirstWatchcontroller,

  hgetTopCities,
  hgetTopContents,
  hgetTopCountries,

  hactiveUserscontroller,
  hviewscontroller,
  //user data 
  userdata,
  userevents,
  useractivity,
  //funnels controllers
  addFunnelController,
  countFunnelsController,
  deleteFunnelController,
  dropoffUsersController,
  getColumnNamesController,
  getCountFunnelsController,
  getDropoffUsersController,
  getEventNamesController,
  getFunnelByIdController,
  getFunnelsController,
  getNonDropoffUsersController,
  nonDropoffUsersController,
  updateFunnelController
};
