const jwt = require("jsonwebtoken");

exports.jwtSign = async (user) => {
  try {
    const accessToken = jwt.sign({ id: user.id, role_id: user.role_id, type: "access" }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY.toString(),
    });

    const refreshToken = jwt.sign({ id: user.id, role_id: user.role_id, type: "refresh" }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY.toString(),
    });

    const token = {
      accessToken,
      refreshToken,
    };

    return token;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.jwtVerify = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return decoded;
  } catch (error) {
    console.log(error);
    throw error;
  }
};