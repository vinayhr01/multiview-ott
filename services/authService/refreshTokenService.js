const { jwtVerify, jwtSign } = require("../../utils/jwt");

exports.refreshTokenService = async (refreshToken) => {
  try {
    const decoded = await jwtVerify(refreshToken);

    const { id, role_id, type } = decoded;

    if (type !== "refresh") {
      throw new Error("Invalid token");
    }

    const token = await jwtSign({ id, role_id, type });

    return token;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
