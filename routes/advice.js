
const express = require('express');
const common = require("../public/javascripts/common.js")
const crud = require("../model/crud.js")
const { getUserNo } = require('../model/user.js');
var router = express.Router();


require("dotenv").config();




/**
* 고민/질문 정보
*/

router.get("/info", async (req, res) => {
  const adviceNo = parseInt(req.query.adviceNo);
  try {
    const { status, rows } = await crud.getDataListFromTable("", "AI_ADVICE_TB", { "ADVICE_NO": adviceNo })
    if (status === -1) {
      console.error('Error Occured at "/advice/info" - ', error);
      res.status(500).json({ message: 'error', error: "Fail to get information from PRAY_LIST_TB at /advice/info" });
    } else {
      res.status(200).json({ message: 'success', adviceInfo: rows[0] });
    }
  } catch (error) {
    console.error('Error Occured at "/advice/info" - ', error);
    res.status(500).json({ message: 'error' });
  }
})



/**
* 고민/질문 리스트
*/

router.get("/list", async (req, res) => {
  const userNo = await getUserNo(req, res);
  if (userNo === null) {
    return res.status(500).json({ status: "error", error: "Failed to get user information at getUserNo at /advice/list" }); // 여기서 오류 응답 처리
  }
  try {
    const { status, rows } = await crud.getDataListFromTable("", "AI_ADVICE_TB", { "USER_NO": userNo, "DELETED_AT": null })
    if (status === -1) {
      console.error('Error Occured at "/pray/list" - ', error);
      return res.status(500).json({ message: 'error', error: "Fail to get list of information from AI_ADVICE_TB at /advice/list" });
    } else {
      res.status(200).json({ message: 'success', adviceList: rows });
    }

  } catch (error) {
    console.error('Error Occured at "/pray/list" - ', error);
    res.status(500).json({ message: 'error' });
  }
})




// 루트 엔드포인트
router.post('/save', async (req, res) => {
  const adviceInfo = req.body;
  const userNo = await getUserNo(req, res);
  if (userNo === null) {
    return res.status(500).json({ status: "error", error: "Failed to get user information at getUserNo at /advice/share" });
  }
  try {
    const { status } = await crud.createDataRow("AI_ADVICE_TB", { "ADVICE_TXT": adviceInfo.advice.replace(/"/g, '\''), "QUESTION": adviceInfo.question, "USER_NO": userNo })
    if (status === -1) {
      res.status(500).json({ message: 'error', error: "Fail to add information from PRAY_LIST_TB at /advice/save" });
    } else {
      res.status(200).json({ message: 'success' });
    }
  } catch (error) {
    console.error('Error Occured at "/advice/save" - ', error);
    res.status(500).json({ message: 'error' });
  }
});

// 루트 엔드포인트
router.post('/share', async (req, res) => {
  const adviceInfo = req.body;
  const userNo = await getUserNo(req, res);
  if (userNo === null) {
    return res.status(500).json({ status: "error", error: "Failed to get user information at getUserNo at /advice/share" });
  }
  try {
    const { status, rows } = await crud.createDataRow("AI_ADVICE_TB", { "ADVICE_TXT": adviceInfo.advice.replace(/"/g, '\''), "QUESTION": adviceInfo.question, "USER_NO": userNo, "QUESTION_TYPE": "share" })
    if (status === -1) {
      res.status(500).json({ message: 'error', error: "Fail to add information from AI_ADVICE_TB at /advice/save" });
    } else {
      const encryptedShareId = common.encrypt(rows.insertId.toString());
      res.status(200).json({ message: 'success', shareId: encryptedShareId });
    }
  } catch (error) {
    console.error('Error Occured at "/advice/save" - ', error);
    res.status(500).json({ message: 'error' });
  }
});


/**
* 고민/질문 삭제
*/

router.post("/delete", async (req, res) => {
  const adviceNo = parseInt(req.body.adviceNo);
  try {
    const { status } = await crud.updateData("AI_ADVICE_TB", { "DELETED_AT": common.jsDateToMysqlDateTime(new Date()) }, { "ADVICE_NO": adviceNo })
    if (status === -1) {
      res.status(500).json({ message: 'error', error: "Fail to update information from AI_ADVICE_TB at /advice/delete" });
    } else {
      res.status(200).json({ message: 'success' });
    }
  } catch (error) {
    console.error('Error Occured at "/advice/delete" - ', error);
    res.status(500).json({ message: 'error' });
  }
})

/**
* 고민/질문 토큰
*/


router.get("/token", async (req, res) => {
  try {
    const encryptAdviceNo = common.encrypt(req.query.adviceNo.toString());
    if (encryptAdviceNo === null) {
      return res.status(500).json({ status: "error", error: "Failed to get user information at getUserNo at /advice/token" });
    } else {
      res.status(200).json({ message: 'success', adviceToken: encryptAdviceNo });
    }
  } catch (error) {
    console.error('Error Occured at "/advice/token" - ', error);
    res.status(500).json({ message: 'error' });
  }
})




module.exports = router