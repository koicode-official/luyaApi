
const express = require('express');
const common = require('../public/javascripts/common');
const crud = require("../model/crud")
var router = express.Router();




router.get("/checkId", async function (req, res) {
  const { status, rows } = await crud.getDataListFromTable('USER_EMAIL', 'USER_TB', { USER_EMAIL: req.query.email })
  if (status !== -1) {
    if (rows.length === 0) {
      res.status(200).send({ status: "Not exist" });
    } else {
      res.status(200).send({ status: "exist", data: rows });
    }
  } else {
    res.status(500).send({ status: "error", error: "Failed to search user information" });
  }
});


router.post("/create", async function (req, res) {
  const inputInfo = req.body;
  console.log('inputInfo', inputInfo)

  const userInfo = {
    USER_NAME: inputInfo.name.value,
    USER_PHONE: inputInfo.phoneNumber.value,
    USER_PASSWORD: inputInfo.password.value,
    USER_EMAIL: inputInfo.email.value,
    USER_GENDER: inputInfo.gender.value,
    // USER_BIRTH_DT: inputInfo.birthday.value,
  }



  //유저 생성
  const { password, salt } = await common.createHashedPassword(userInfo["USER_PASSWORD"]);
  userInfo["USER_PASSWORD"] = password
  userInfo["USER_SALT_KEY"] = salt

  console.log('userInfo', userInfo);
  const { status: userCreateStatus, rows: userCreateRows } = await crud.createDataRow('USER_TB', userInfo)
  console.log('userCreateRows', userCreateRows);
  if (userCreateStatus === -1) {
    res.status(500).send({ status: "error", error: "Failed to create user information" });
  } else {
    res.status(200).send({ status: "success" })
  }

});

module.exports = router;