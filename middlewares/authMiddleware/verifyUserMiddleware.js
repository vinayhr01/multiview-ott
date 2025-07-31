const { jwtVerify } = require("../../utils/jwt");

exports.verifyUserMiddleware = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({
                success: false,
                message: "No token provided",
            });
        }

        const token = req.headers.authorization.split(" ")[1];
        const decoded = await jwtVerify(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }

        else if (decoded?.exp * 1000 < Date.now()) {
            return res.status(401).json({
                success: false,
                message: "Token expired",
            });
        }

        req.user = decoded;
        next();
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Invalid authentication " + error,
        });
    }
}