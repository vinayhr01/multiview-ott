const express = require("express");
const cors = require("cors");
const app = express();
const compression = require("compression");
const { routes } = require("./routes");
// const { middleware } = require("./middlewares");
const logger = require('./utils/logger');
const loggingMiddleware = require('./middlewares/loggingMiddleware');

// const swaggerUi = require("swagger-ui-express");
// const swaggerFile = require("./swagger_output_v1.json");

require("dotenv").config();
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "100mb" }));

app.use(loggingMiddleware);

app.use(compression({ threshold: 0.0001, level: 9 }));
app.use(cors());


// User routes
// Auth routes
app.use("/api/v1/auth", routes.authRoutes);
// // DAU & MAU Routes
// app.use("/api/v1/dau_mau", middleware.verifyUserMiddleware, routes.dauMauRoutes);
// // Admin routes
// // Auth routes
// app.use("/api/v1/admin/auth", middleware.verifyUserMiddleware, routes.adminAuthRoutes);
// // Chart routes
// app.use("/api/v1/chart", middleware.verifyUserMiddleware, routes.chartRoutes);


// //subs 24 hours
// app.use('/api/v1/subscibers', middleware.verifyUserMiddleware, routes.subsRoutes);

// // chart data routes and top content routes and metrics routes for real
// app.use('/api/v1/real_topdata', middleware.verifyUserMiddleware, routes.topcontentRoutes);
// app.use('/api/v1/real_userview', middleware.verifyUserMiddleware, routes.userViewRoutes);
// app.use('/api/v1/real_durationroutes', middleware.verifyUserMiddleware, routes.durationRoutes);
// //search for real 
// app.use("/api/v1/real_search", middleware.verifyUserMiddleware, routes.searchRoutes);

// // chart data routes and top content routes and metrics routes for historical
// app.use('/api/v1/hist_topdata', middleware.verifyUserMiddleware, routes.htopcontentRoutes);
// // app.use('/api/v1/hsubs', middleware.verifyUserMiddleware, routes.hsubsRoutes);
// app.use('/api/v1/hist_userview', middleware.verifyUserMiddleware, routes.huserViewRoutes);
// app.use('/api/v1/hist_durationroutes', middleware.verifyUserMiddleware, routes.hdurationRoutes);
// //search for historical
// app.use("/api/v1/hist_search", middleware.verifyUserMiddleware, routes.hsearchRoutes);

// //Engagement metrics
// app.use("/api/v1/engagement_routes", middleware.verifyUserMiddleware, routes.engagementRoutes);
// //free paid user data - fpud
// app.use("/api/v1/freepaiduser_routes", middleware.verifyUserMiddleware, routes.freepaidRoutes);
// //Activity
// app.use("/api/v1/activity", middleware.verifyUserMiddleware, routes.activityRoutes);
// //User Data
// app.use("/api/v1/userdata", middleware.verifyUserMiddleware, routes.userRoutes);

// //funnels routes
// app.use("/api/v1/funnels", middleware.verifyUserMiddleware, routes.funnelRoutes);

// if (process.env.ENVIRONMENT === "STAGING") {
//   app.use("/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
// }

// // app.use("/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile))

app.use((err, req, res, next) => {
  logger.error({
    message: 'Error',
    error: err.stack,
    request: {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
    },
  });
  res.status(500).json({ success: false, message: 'Something went wrong ' + err.stack });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});