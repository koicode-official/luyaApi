
const express = require('express');
const crypto = require('crypto');
const common = require('../public/javascripts/common');
const crud = require("../model/crud");
var router = express.Router();
const { getUserNo } = require('../model/user.js');


router.get("/info", async (req, res) => {
  const userNo = await getUserNo(req, res);
  const encryptedUserId = common.encrypt(userNo.toString());
  const { status, rows } = await crud.getDataListFromTable('USER_NAME', 'USER_TB', { USER_NO: userNo })
  if (status !== -1) {
    res.status(200).send({ status: "success", userName: rows[0].USER_NAME, userToken: encryptedUserId });
  } else {
    res.status(500).send({ status: "error", error: "Failed to search user information" });
  }
})


router.post("/create", async function (req, res) {
  const inputInfo = req.body;

  const userInfo = {
    USER_NAME: inputInfo.name.value,
    USER_PHONE: inputInfo.phoneNumber.value,
    USER_PASSWORD: inputInfo.password.value,
    USER_EMAIL: inputInfo.email.value,
    USER_GENDER: inputInfo.gender.value,
    USER_BIRTH_DT: inputInfo.birthday.value,
  }


  //유저 생성
  const { password, salt } = await common.createHashedPassword(userInfo["USER_PASSWORD"]);
  userInfo["USER_PASSWORD"] = password
  userInfo["USER_SALT_KEY"] = salt

  const { status: userCreateStatus, rows: UserCreateRows } = await crud.createDataRow('USER_TB', userInfo)

  if (userCreateStatus === -1) {
    res.status(500).send({ status: "error", error: "Failed to create user information" });
  } else {
    res.status(200).send({ status: "success" })
  }

});





module.exports = router;