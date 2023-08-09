

var express = require("express");
var router = express.Router();
const CryptoJS = require("crypto-js");
const axios = require("axios");
var cache = require("memory-cache");
require("dotenv").config();


router.get("/sendcode", function (req, res) {
  const userPhone = req.query.userPhone;
  cache.del(userPhone);
  send_auth_code(userPhone, res);
});


router.get("/verify", function (req, res) {
  const userAuth = req.query.userAuth;
  const userPhone = req.query.userPhone;
  const cacheAuthNumber = cache.get(userPhone);
  if (userAuth === cacheAuthNumber) {
    res.status(200).send({ status: "success" });
    cache.del(userPhone);
  } else {
    res
      .status(200)
      .send({ status: "fail", message: "인증번호가 일치하지않습니다." });
  }
});


async function send_auth_code(phone, res) {
  authNumber = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
  var user_phone_number = phone; //수신 전화번호 기입
  cache.put(phone, authNumber, 60000);
  const date = Date.now().toString();
  const uri = process.env.NAVER_SENSE_SERVICE_ID; //서비스 ID
  const secretKey = process.env.NAVER_SENSE_SECRET_KEY; // Secret Key
  const accessKey = process.env.NAVER_SENSE_ACCESS_KEY; //Access Key
  const method = "POST";
  const space = " ";
  const newLine = "\n";
  const url = `https://sens.apigw.ntruss.com/sms/v2/services/${uri}/messages`;
  const url2 = `/sms/v2/services/${uri}/messages`;
  const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);
  hmac.update(method);
  hmac.update(space);
  hmac.update(url2);
  hmac.update(newLine);
  hmac.update(date);
  hmac.update(newLine);
  hmac.update(accessKey);
  const hash = hmac.finalize();
  const signature = hash.toString(CryptoJS.enc.Base64);
  await axios({
    method: method,
    url: url,
    headers: {
      "Contenc-type": "application/json; charset=utf-8",
      "x-ncp-iam-access-key": accessKey,
      "x-ncp-apigw-timestamp": date,
      "x-ncp-apigw-signature-v2": signature,
    },
    data: {
      type: "SMS",
      countryCode: "82",
      from: "07088339130",
      content: `루야-인증번호는[${authNumber}]입니다.`,
      messages: [{ to: `${user_phone_number}` }],
    },
  }).then((result) => {
    const resultCode = result.data;
    if (
      resultCode.statusCode === "202" &&
      resultCode.statusName === "success"
    ) {
      res.status(200).send({ status: "success" });
    } else {
      cache.del(phone)
      res
        .status(500)
        .send({ status: "success", message: "문자전송에 실패했습니다." });
    }
  });
}


module.exports = router


// router.get("/sendcodewithname", async function (req, res) {
//   const userPhone = req.query.userPhone;
//   const userName = req.query.userName;
//   const userEmail = req.query.userEmail;
//   const { status: userStatus, rows: userRows } = await crud.getDataListFromTable('', 'USER_TB', { USER_NAME: userName, USER_PHONE: userPhone , USER_EMAIL: userEmail })
//   if (userStatus === -1) {
//     res.status(500).send({ status: "error", error: "Failed to get User infomation at /sendcodewithname" });
//   } else if (userRows.length === 0) {
//     res.status(200).send({ status: "not exist", error: "Failed to get User infomation at /sendcodewithname" });
//   } else {
//     cache.del(userPhone);
//     send_auth_code(userPhone, res);
//   }
// });