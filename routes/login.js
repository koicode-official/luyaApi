var express = require("express");
var router = express.Router();
var jwToken = require("../public/javascripts/jwt.js");
var crud = require("../model/crud.js")
var common = require("../public/javascripts/common.js")
const crypto = require('crypto')
var axios = require("axios");
const { getUserNo } = require("../model/user.js");
require("dotenv").config();
var auth = require("../middleware/auth.js")

const KAKAO_RESTAPI_KEY = process.env.KAKAO_RESTAPI_KEY;

router.post("/", async (req, res) => {

  const loginInfo = common.reqToDatabaseFormat(req.body);
  const { rows } = await crud.getDataListFromTable('', 'USER_TB', { USER_EMAIL: loginInfo.USER_EMAIL, WITHDRAWAL_DT: null })
  if (!rows || rows.length === 0) {
    res.status(200).send({ status: "not found", error: "User information is not found" });
  } else {
    //비밀번호 비교
    crypto.pbkdf2(loginInfo.USER_PASSWORD, rows[0].USER_SALT_KEY, 9999, 64, 'sha512', (err, key) => {
      if (err) {
        res.status(500).send({ status: "fail", error: "Failed to salting password" });
      } else {
        // common.setJwtTokens(req, res, rows[0].USER_EMAIL, rows[0].USER_PHONE);
        // res.status(200).send({
        //   status: "success",
        // });
        if (key.toString('base64') === rows[0].USER_PASSWORD) {
          common.setJwtTokens(req, res, rows[0].USER_EMAIL, rows[0].USER_PHONE);
          res.status(200).send({
            status: "success",
          });
        } else {
          res.status(200).send({ status: "fail", error: "Wrong password" });
        }


      }
    });
  }

});


router.get("/logout", async (req, res) => {
  try {
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
    res.status(200).send({ status: "success", error: "logout" });

  } catch (error) {
    res.status(200).send({ status: "fail", error: error });

  }

})

router.post("/kakaologinvalidation", async (req, res) => {
  const code = req.body.code
  await axios({
    url: "https://kauth.kakao.com/oauth/token",
    method: "POST",
    headers: {
      'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
    },
    data: {
      grant_type: "authorization_code",
      client_id: KAKAO_RESTAPI_KEY,
      redirect_uri: `http://localhost:3000/login/kakaologin`,
      code: code
    }
  }).then(response => {
    res.status(200).send({ status: "success", data: response.data })
  })


})



router.post("/kakaologin", async (req, res) => {
  const userInfo = req.body.userInfo;
  const userKakaoId = userInfo.id;
  const kakaoAccount = userInfo.kakao_account;
  const userEmail = kakaoAccount.email;
  const userPhone = kakaoAccount.has_phone_number === true ? "0" + kakaoAccount.phone_number.split(" ")[1].replace(/[^0-9]/g, "") : null;
  console.log(userPhone);
  const userGender = kakaoAccount.has_gender === true ? kakaoAccount.gender : null
  const birthDay = `${kakaoAccount.birthyear}-${kakaoAccount.birthday[0]}${kakaoAccount.birthday[1]}-${kakaoAccount.birthday[2]}${kakaoAccount.birthday[3]}`
  // const birthDay = `${kakaoAccount.birthday[0]}${kakaoAccount.birthday[1]}-${kakaoAccount.birthday[2]}${kakaoAccount.birthday[3]}`
  
  const signupInfo = {
    USER_TYPE: `kakao_${userKakaoId}`,
    USER_NAME: kakaoAccount.name,
    USER_PHONE: userPhone,
    USER_EMAIL: userEmail,
    USER_GENDER: userGender,
    USER_BIRTH_DT: common.jsDateToMysqlDateTime(birthDay),
  }

  console.log('kakaoAccount', kakaoAccount)
  console.log('signupInfo', signupInfo);
  const { status: userStatus, rows: userRows } = await crud.getDataListFromTable('', 'USER_TB', { USER_EMAIL: userEmail, WITHDRAWAL_DT: null });
  if (userStatus === -1) {
    res.status(500).send({ status: "error", error: "Failed to get User infomation at /login/kakaologin" });
  }
  if (userRows.length === 0) {

    const { password, salt } = await common.createHashedPassword(userKakaoId + new Date());
    signupInfo["USER_PASSWORD"] = password
    signupInfo["USER_SALT_KEY"] = salt

    const { status, rows: createdUserRows } = await crud.createDataRow('USER_TB', signupInfo);

    if (status !== -1) {
      common.setJwtTokens(req, res, userEmail, userPhone);
      res.status(200).send({ status: "success", message: "new user" });
    } else {
      res.status(200).send({ status: "error", error: "Failed to create user information" });
    }

  } else {
    common.setJwtTokens(req, res, userEmail, userPhone);
    res.status(200).send({
      status: "success",
    });
  }
})

router.post("/simplesignup", auth, async (req, res) => {
  const userNo = await getUserNo(req, res);
  if (userNo === null) {
    return res.status(500).json({ status: "error", error: "Failed to get user information at getUserNo at /login/simplesignup" }); // 여기서 오류 응답 처리
  }
  const { funnel, recommendCode } = req.body

  //마일리지 등록
  let recommendMiles = 0;
  if (recommendCode != null) {
    const { status: userStatus, rows: userRows } = await crud.getDataListFromTable('UserNo', 'UserMst', { RecommendCode: recommendCode, StatusCode: "normal" })
    if (userStatus === -1) {
      res.status(500).send({ status: "error", error: "Failed to get user information" });
    }
    recommendMiles = userRows.length !== 0 ? 7000 : 0;

    if (recommendMiles !== 0) {

      const milesEventInfo = {
        UserNo: userNo,
        StatusCode: "적립",
        Amount: recommendMiles,
        EventType: "회원가입"
      }

      const { status: MilesEventMst, rows: MilesEventMstRows } = await crud.createDataRow('MilesEventMst', milesEventInfo);
      if (MilesEventMst === -1) {
        res.status(500).send({ status: "error", error: "Failed to create MilesEventMst information" });
      }

      const result = await addMiles(MilesEventMstRows.insertId, recommendMiles, userNo)
      if (result.status === -1) {
        res.status(500).send({ status: "error", error: "Failed to create MilesDetailMst information" });
      }
    }
  }


  const { status } = await crud.updateData('UserMst', { Funnel: funnel }, { UserNo: userNo })
  if (status === -1) {
    res.status(500).send({ status: "error", error: "유입경로 등록에 실패했습니다." });
  } else {
    res.redirect(307, "/api/address/add");
  }
})


router.get("/check", auth, async (req, res) => {
  res.status(200).send({ status: "success" })
})

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



module.exports = router;

