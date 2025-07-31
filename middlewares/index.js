const { loginMiddleware } = require("./authMiddleware/loginMiddleware");
const { registerMiddleware } = require("./authMiddleware/registerMiddleware");
const { verifyUserMiddleware } = require("./authMiddleware/verifyUserMiddleware");
const { checkRole } = require("./checkRole");
const loggingMiddleware = require("./loggingMiddleware");

exports.middleware = {
    loginMiddleware: loginMiddleware, 
    registerMiddleware: registerMiddleware,
    checkRole: checkRole,
    verifyUserMiddleware: verifyUserMiddleware,
    loggingMiddleware: loggingMiddleware,
}