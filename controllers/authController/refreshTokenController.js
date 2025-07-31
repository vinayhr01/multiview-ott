const { services } = require("../../services");

exports.refreshTokenController = async (req, res) => {
    try {
        const refreshToken = req.headers.authorization.split(" ")[1];

        const token = await services.refreshTokenService(refreshToken);

        res.json({ success: true, message: "Token generated successfully", data: { accessToken: token.accessToken } });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Token could not be generated, Please provide valid refresh token " + error
        });
    }
}