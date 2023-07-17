

var jwToken = require("./jwt.js");
const crypto = require('crypto')
require("dotenv").config();

const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES;
const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES;


const common = {
  findObjectById: (obj, id) => {
    return obj.find(item => item.id === id);
  },
  formatDate: (date) => {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day].join('-');
  },
  jsDateToMysqlDateTime: (date) => {
    /**
     * 각 시스템환경이 KST에 맞춰있어야한다.
     */
    const d = new Date(date);
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');
  },
  jsDateToMysqlDate: (date) => {
    /**
     * 각 시스템환경이 KST에 맞춰있어야한다.
     */
    const d = new Date(date);
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ').split(" ")[0];
  },
  formatLocaleDate: (date) => {
    /**
     * 각 시스템환경이 KST에 맞춰있어야한다.
     */
    const d = new Date(date);
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
  },
  upperCaseAtFirstChar: (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  },

  DatabaseToResFormat: (rows) => {
    let tmp = [];
    rows.forEach((row) => {
      let dataList = {}
      for (const [key, value] of Object.entries(row)) {
        dataList[key.charAt(0).toLowerCase() + key.slice(1)] = typeof value === "boolean" ? value === true ? 1 : 0 : value
      }
      tmp.push(dataList);
    })
    return tmp
  },
  reqToDatabaseFormat: (requestBody) => {
    let dataList = {}
    for (const [key, value] of Object.entries(requestBody)) {
      dataList[key.charAt(0).toUpperCase() + key.slice(1)] = typeof value === "boolean" ? value === true ? 1 : 0 : value
    }
    return dataList
  },
  getUserInfoFromCookie: (cookie) => {
    const JWT_KEY = process.env.JWT_SECRET_KEY;
    const { UserEmail, UserPhone } = jwToken.verify(cookie, JWT_KEY);
    return { UserEmail: UserEmail, UserPhone: UserPhone }
  },
  createHashedPassword: async (plainPassword) => {
    return new Promise(async (resolve, reject) => {
      const salt = await new Promise((resolve, reject) => {
        crypto.randomBytes(64, (err, buf) => {
          if (err) reject(err);
          resolve(buf.toString('base64'));
        });
      });;
      crypto.pbkdf2(plainPassword, salt, 9999, 64, 'sha512', (err, key) => {
        if (err) reject(err);
        resolve({ password: key.toString('base64'), salt });
      });
    })
  },
  setJwtTokens: (req, res, userEmail, userPhone) => {
    const accessToken = jwToken.accessToken({ UserEmail: userEmail, UserPhone: userPhone });
    const refreshToken = jwToken.refreshToken({ UserEmail: userEmail, UserPhone: userPhone });
    const today = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000));
    const accessTokenExpires = new Date(Number(today) + Number(ACCESS_TOKEN_EXPIRES))
    const refreshTokenExpires = new Date(Number(today) + Number(REFRESH_TOKEN_EXPIRES))
    res.cookie("_actk", accessToken, {
      path: "/",
      httpOnly: true,
      expires: accessTokenExpires,
      // domain: "." + req.get('origin'),
    });
    res.cookie("_rftk", refreshToken, {
      path: "/",
      httpOnly: true,
      expires: refreshTokenExpires,
      // domain: "." + req.get('origin'),
      // secure: false, //https 사용시 true
    });
  }
}

module.exports = common