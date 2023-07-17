var jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_KEY = process.env.JWT_SECRET_KEY;

const jwToken = {
  verify: (token) => {
    let decoded = null;
    try {
      decoded = jwt.verify(token, JWT_KEY);
      return {
        ok: true,
        UserEmail: decoded.UserEmail,
        UserPhone: decoded.UserPhone,
      };
    } catch (err) {
      return {
        ok: false,
        message: err.message,
      };
    }
  },
  accessToken: (userInfo) => {
    return jwt.sign(
      {
        UserEmail: userInfo.UserEmail,
        UserPhone: userInfo.UserPhone,
      },
      JWT_KEY,
      {
        algorithm: "HS256",
        expiresIn: "3h",
      }
    );
  },
  refreshToken: (userInfo) => {
    return jwt.sign(
      {
        UserEmail: userInfo.UserEmail,
        UserPhone: userInfo.UserPhone,
        Role: "refresh",
      },
      JWT_KEY,
      {
        algorithm: "HS256",
        expiresIn: "10d",
      }
    );
  },
};

module.exports = jwToken;
