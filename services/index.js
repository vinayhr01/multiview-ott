// services/index.js

// Auth Services imports
const { loginService } = require("./authService/loginService");
const { registerService } = require("./authService/registerService");
const { updateRoleService, getRoleService, listUsersService } = require("./authService/adminAuthService");
const { forgotPasswordInitiateService } = require("./authService/forgotPasswordInitiateService");
const { verifyOtpService } = require("./authService/verifyOtpService");
const { updatePasswordService } = require("./authService/updatePasswordService");

// DAU Services imports
const { dauService } = require("./clickhouseService/dauService/dauService");

// MAU Services imports
const { mauService } = require("./clickhouseService/mauService/mauService");
const { refreshTokenService } = require("./authService/refreshTokenService");

// Chart Services imports
const { getGenreWiseCompletion } = require("./clickhouseService/chartServices/genreWiseCompletionService");
const { getContentValueWise } = require("./clickhouseService/chartServices/contentValueWiseService");
const { getTop10Movies } = require("./clickhouseService/chartServices/top10MoviesService");
const { getTop10MoviesDuration } = require("./clickhouseService/chartServices/top10MoviesDurationService");
const { getTop10Shows } = require("./clickhouseService/chartServices/top10ShowsService");
const { getTop10ShowsDuration } = require("./clickhouseService/chartServices/top10ShowsDurationService");
const { getContentTypeWiseConsumption } = require("./clickhouseService/chartServices/contentTypeWiseConsumptionService");
const { getPlatformWiseConsumption } = require("./clickhouseService/chartServices/platformWiseConsumptionService");
const { getPageWiseConsumption } = require("./clickhouseService/chartServices/pageWiseConsumptionService");

//top Content Sevices
const { topCitiesService } = require("./clickhouseService/topcontentServices/topCities.service");
const { topContentsService } = require("./clickhouseService/topcontentServices/topContents.service");
const { topCountriesService } = require("./clickhouseService/topcontentServices/topCountries.service");

//user, subs and dura
const { viewsService } = require("./clickhouseService/userViewServices/viewsservice");
const { activeUsersService } = require("./clickhouseService/userViewServices/activeUsersservice");
const { subsFirstWatchService } = require("./clickhouseService/subsServices/subsFirstWatchservice");
const { subs24HrsFirstWatchService } = require("./clickhouseService/subsServices/subs24HrsFirstWatchservice");
const { durationPerViewerService } = require("./clickhouseService/durationServices/durationPerViewerservice");
const { durationInMinsService } = require("./clickhouseService/durationServices/durationInMinsservice");

//search
const { searchFiltersService } = require("./clickhouseService/searchFiltersService/searchFiltersService");

//engagement metrics
const { totalViewsService } = require("./clickhouseService/engagementService/totalViewsService");
const { totalWatchTimeService } = require("./clickhouseService/engagementService/totalWatchTimeService");
const { totalActiveUsersService } = require("./clickhouseService/engagementService/totalActiveUsersService");

//free paid user data
const { freeUserMinService } = require("./clickhouseService/freePaidService/freeUserMinService");
const { overallFreeService } = require("./clickhouseService/freePaidService/overallFreeService");
const { overallPaidService } = require("./clickhouseService/freePaidService/overallPaidService");
const { paidUserMinService } = require("./clickhouseService/freePaidService/paidUserMinService");
//Activity Services
const { activeService } = require("./clickhouseService/activityServices/activeService");
const { activeLast30MinService } = require("./clickhouseService/activityServices/activeLast30MinService");
const { activeLast1HourService } = require("./clickhouseService/activityServices/activeLast1HourService");
const { activeLast6HoursService } = require("./clickhouseService/activityServices/activeLast6HoursService");
const { hdurationInMinsService } = require("./clickhouseService/hdurationServices/hdurationInMinsService");
const { hdurationPerViewerService } = require("./clickhouseService/hdurationServices/hdurationPerViewerService");
const { hsearchFiltersService } = require("./clickhouseService/hsearchFiltersService/hsearchFiltersService");
// const { hsubs24HrsFirstWatchService } = require("./clickhouseService/hsubsServices/hsubs24HrsFirstWatchService");
// const { hsubsFirstWatchService } = require("./clickhouseService/hsubsServices/hsubsFirstWatchService");
const { htopCitiesService } = require("./clickhouseService/htopcontentServices/htopCities.service");
const { htopContentsService } = require("./clickhouseService/htopcontentServices/htopContents.service");
const { htopCountriesService } = require("./clickhouseService/htopcontentServices/htopCountries.service");
const { hactiveUsersService } = require("./clickhouseService/huserViewServices/hactiveUsersService");
const { hviewsService } = require("./clickhouseService/huserViewServices/hviewsService");
const { userdataService } = require("./clickhouseService/userActivityServices/userdataService");
const { usereventsService } = require("./clickhouseService/userActivityServices/usereventsService");
const { useractivityService } = require("./clickhouseService/userActivityServices/useractivityService");
//funnels services
const { addFunnelService } = require("./clickhouseService/funnelServices/addFunnelService");
const { countFunnelsService } = require("./clickhouseService/funnelServices/countFunnelsService");
const { deleteFunnelService } = require("./clickhouseService/funnelServices/deleteFunnelService");
const { dropoffUsersService } = require("./clickhouseService/funnelServices/dropoffUsersService");
const { getColumnNamesService } = require("./clickhouseService/funnelServices/getColumnNamesService");
const { getCountFunnelsService } = require("./clickhouseService/funnelServices/getCountFunnelsService");
const { getDropoffUsersService } = require("./clickhouseService/funnelServices/getDropoffUsersService");
const { getEventNamesService } = require("./clickhouseService/funnelServices/getEventNamesService");
const { getFunnelByIdService } = require("./clickhouseService/funnelServices/getFunnelByIdService");
const { getFunnelsService } = require("./clickhouseService/funnelServices/getFunnelsService");
const { getNonDropoffUsersService } = require("./clickhouseService/funnelServices/getNonDropoffUsersService");
const { nonDropoffUsersService } = require("./clickhouseService/funnelServices/nonDropoffUsersService");
const { updateFunnelService } = require("./clickhouseService/funnelServices/updateFunnelService");


exports.services = {
  // Auth Services
  loginService,
  refreshTokenService,
  registerService,
  forgotPasswordInitiateService,
  verifyOtpService,
  updatePasswordService,
  updateRoleService,
  getRoleService,
  listUsersService,
  // DAU Services
  dauService,
  // MAU Services
  mauService,
  // Chart Services
  getGenreWiseCompletion,
  getContentValueWise,
  getTop10Movies,
  getTop10MoviesDuration,
  getTop10Shows,
  getTop10ShowsDuration,
  getContentTypeWiseConsumption,
  getPlatformWiseConsumption,
  getPageWiseConsumption,
  //top content services
  topContentsService,
  topCountriesService,
  topCitiesService,
  //user, du c, subs
  viewsService,
  activeUsersService,
  subsFirstWatchService,
  subs24HrsFirstWatchService,
  durationPerViewerService,
  durationInMinsService,
  //search filter
  searchFiltersService,
  //engagement metrics
  totalViewsService,
  totalWatchTimeService,
  totalActiveUsersService,
  //free paid user data
  freeUserMinService,
  overallFreeService,
  overallPaidService,
  paidUserMinService,
  //Activity Services
  activeService,
  activeLast30MinService,
  activeLast1HourService,
  activeLast6HoursService,

  hdurationInMinsService,
  hdurationPerViewerService,

  hsearchFiltersService,

  // hsubs24HrsFirstWatchService,
  // hsubsFirstWatchService,

  htopCitiesService,
  htopContentsService,
  htopCountriesService,

  hactiveUsersService,
  hviewsService,

  userdataService,
  usereventsService,
  useractivityService,

  //funnels services
  addFunnelService,
  countFunnelsService,
  deleteFunnelService,
  dropoffUsersService,
  getColumnNamesService,
  getCountFunnelsService,
  getDropoffUsersService,
  getEventNamesService,
  getFunnelByIdService,
  getFunnelsService,
  getNonDropoffUsersService,
  nonDropoffUsersService,
  updateFunnelService
};
