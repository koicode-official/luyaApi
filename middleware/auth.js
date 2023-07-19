var jwToken = require("../public/javascripts/jwt.js");
require("dotenv").config();

const JWT_KEY = process.env.JWT_SECRET_KEY;
const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES;
const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES;

const authorizationJwt = (req, res, next) => {
  const accessToken = req.cookies._actk ? req.cookies._actk : req.accessToken;
  const refreshToken = req.cookies._rftk;
  let accessTokenVerification = null;
  let refreshTokenVerification = jwToken.verify(refreshToken, JWT_KEY);
  let loginInfo = {};
  //둘다 없을때
  if (!accessToken && !refreshToken) {
    res.status(200).send({
      status: "fail",
      message: "expired",
    });
    res.end();
  }

  if (accessToken && refreshToken) {
    accessTokenVerification = jwToken.verify(accessToken, JWT_KEY);
    if (accessTokenVerification.ok) {//accessToken 인증 정상
      req.loginInfo = accessTokenVerification;
      req.accessToken = accessToken;
      console.log("인증 완료 - 정상")
      next();
    } else if (
      accessTokenVerification.ok === false &&
      accessTokenVerification.message === "jwt expired"
    ) {//accessToken 만료 재발급
      if (refreshTokenVerification.ok === false) {
        console.log(" access token 및 refresh token이 둘다 만료 ");
        res.clearCookie('_actk');
        res.clearCookie('_rftk');
        res.status(200).send({
          status: "fail",
          message: "expired",
        });
        res.end();

      } else {
        const newAccessToken = jwToken.accessToken({
          UserEmail: refreshTokenVerification.UserEmail,
          UserPhone: refreshTokenVerification.UserPhone,
        });
        console.log("액세스 토큰 만료 - 재발급");
        const accessTokenExpires = new Date(Number(new Date()) + Number(ACCESS_TOKEN_EXPIRES))
        res.cookie("_actk", newAccessToken, {
          path: "/",
          httpOnly: true,
          expires: accessTokenExpires,
        });
        req.accessToken = newAccessToken;
        next();
      }
    } else {
      res.clearCookie('_actk');
      res.clearCookie('_rftk');
      res.status(200).send({
        status: "fail",
        message: "expired",
      });
      res.end();
    }
  } else {
    //access token이 없을때
    if (refreshTokenVerification.ok) {
      //refreshToken 인증이 정상이면 refreshToken 정보로 accessToken 발급
      console.log(" access token만  만료 ");
      const newAccessToken = jwToken.accessToken({
        UserEmail: refreshTokenVerification.UserEmail,
        UserPhone: refreshTokenVerification.UserPhone,
      });
      const accessTokenExpires = new Date(Number(new Date()) + Number(ACCESS_TOKEN_EXPIRES))
      res.cookie("_actk", newAccessToken, {
        path: "/",
        httpOnly: true,
        expires: accessTokenExpires,
      });
      console.log(" access token 재발급 ");
      req.accessToken = accessToken;
      next();
    } else if (
      refreshTokenVerification.ok === false &&
      refreshTokenVerification.message === "jwt expired"
    ) {
      //access token 및 refresh token이 둘다 만료
      console.log(" access token 및 refresh token이 둘다 만료 ");
      res.clearCookie('_actk');
      res.clearCookie('_rftk');
      res.status(500).send({
        status: "fail",
        message: "expired",
      });
      res.end();
    } 
  }

};

module.exports = authorizationJwt;
