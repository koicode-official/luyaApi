var db = require("../db/db");
var common = require("../public/javascripts/common.js")
var crud = require("./crud.js")
const crypto = require('crypto')



const user = {
  getUserNo: async (req, res) => {
    const userInfo = common.getUserInfoFromCookie(req.accessToken);
    const { status, rows: userRows } = await crud.getDataListFromTable('USER_NO', 'USER_TB', { USER_EMAIL: userInfo.UserEmail, USER_PHONE: userInfo.UserPhone })
    if (status === -1 || userRows.length === 0) {
    
      return null;
    }
    return userRows[0].USER_NO;
  },
  checkPassword: async (password, salt) => {
    crypto.pbkdf2(password, salt, 9999, 64, 'sha512', (err, key) => {
      if (err) {
        return { status: -1, message: err }
      } else {
        return { status: 1, message: "valid" }
      }
    });
  }

}

module.exports = user