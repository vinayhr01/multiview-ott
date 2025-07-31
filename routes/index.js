const { adminAuthRoutes } = require("./authRoutes/adminAuth");
const { authRoutes } = require("./authRoutes/authRoutes");
const { dauMauRoutes } = require("./clickhouseRoutes/dauMauRoutes/dauMauRoutes");
const { chartRoutes } = require("./clickhouseRoutes/chartRoutes/chartRoutes");
const { topcontentRoutes } = require("./clickhouseRoutes/topcontentRoutes/topcontentRoutes");
const { subsRoutes } = require("./clickhouseRoutes/subsRoutes/subsRoutes");
const { userViewRoutes } = require("./clickhouseRoutes/userViewRoutes/userViewRoutes");
const { durationRoutes } = require("./clickhouseRoutes/durationRoutes/durationRoutes");
const { searchRoutes } = require("./clickhouseRoutes/searchRoutes/searchRoutes");
const { engagementRoutes } = require("./clickhouseRoutes/engagementRoutes/engagementRoutes");
const { freepaidRoutes } = require("./clickhouseRoutes/freepaidRoutes/freepaidRoutes");
const { activityRoutes } = require("./clickhouseRoutes/activityRoutes/activityRoutes");
const { hsearchRoutes } = require("./clickhouseRoutes/hsearchRoutes/hsearchRoutes");
// const { hsubsRoutes } = require("./clickhouseRoutes/hsubsRoutes/hsubsRoutes");
const { htopcontentRoutes } = require("./clickhouseRoutes/htopcontentRoutes/htopcontentRoutes");
const { huserViewRoutes } = require("./clickhouseRoutes/huserViewRoutes/huserViewRoutes");
const { hdurationRoutes } = require("./clickhouseRoutes/hdurationRoutes/hdurationRoutes");
const { userRoutes } = require("./clickhouseRoutes/useractivityRoutes/useractivityRoutes");
//funnels routes
const { funnelRoutes } = require("./clickhouseRoutes/funnelRoutes/funnelRoutes");

exports.routes = {
  authRoutes: authRoutes,
  adminAuthRoutes: adminAuthRoutes,
  dauMauRoutes: dauMauRoutes,
  chartRoutes: chartRoutes,
  topcontentRoutes: topcontentRoutes,
  subsRoutes: subsRoutes,
  userViewRoutes:userViewRoutes,
  durationRoutes: durationRoutes,
  searchRoutes: searchRoutes,
  engagementRoutes:engagementRoutes,
  freepaidRoutes : freepaidRoutes,
  activityRoutes : activityRoutes,
  hdurationRoutes : hdurationRoutes,
  hsearchRoutes : hsearchRoutes,
  // hsubsRoutes : hsubsRoutes,
  htopcontentRoutes : htopcontentRoutes,
  huserViewRoutes : huserViewRoutes,
  //user data routes
  userRoutes : userRoutes ,
  //funnels routes
  funnelRoutes : funnelRoutes
}