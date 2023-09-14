
const express = require('express');
const crypto = require('crypto');
const common = require('../public/javascripts/common');
const crud = require("../model/crud");
var router = express.Router();
const { getUserNo } = require('../model/user.js');


router.get("/info", async (req, res) => {
  const userNo = await getUserNo(req, res);
  if (userNo === null) {
    return res.status(500).json({ status: "error", error: "Failed to get user information at getUserNo" }); // 여기서 오류 응답 처리
  }
  const encryptedUserId = common.encrypt(userNo.toString());
  const { status, rows } = await crud.getDataListFromTable('', 'USER_TB', { USER_NO: userNo })
  if (status !== -1) {
    res.status(200).send({ status: "success", userName: rows[0].USER_NAME, userEmail: rows[0].USER_EMAIL, userToken: encryptedUserId });
  } else {
    res.status(500).send({ status: "error", error: "Failed to search user information" });
  }
});


router.get("/delete", async (req, res) => {
  const userNo = await getUserNo(req, res);
  if (userNo === null) {
    return res.status(500).json({ status: "error", error: "Failed to get user information at getUserNo" }); // 여기서 오류 응답 처리
  }
  const { status, rows } = await crud.updateData('USER_TB', { "WITHDRAWAL_DT": common.jsDateToMysqlDateTime(new Date()) }, { USER_NO: userNo })
  if (status !== -1) {
    res.cookie("_actk", "", {
      path: "/",
      httpOnly: true,
      expires: new Date(),
    });
    res.cookie("_rftk", "", {
      path: "/",
      httpOnly: true,
      expires: new Date(),
    });
    res.status(200).send({ status: "success" });
  } else {
    res.status(500).send({ status: "error", error: "Failed to delte user information at /user/delete" });
  }
});






module.exports = router;