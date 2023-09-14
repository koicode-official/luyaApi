const express = require('express');
const common = require("../public/javascripts/common.js")
const crud = require("../model/crud.js");
var router = express.Router();
require("dotenv").config();




/**
* 기도제목 리스트
*/

router.get("/list", async (req, res) => {
  const userToken = req.query.userToken;
  const userNo = common.decrypt(userToken);
  let whereParse = { "USER_NO": userNo, "DELETED_AT": null, "PRAY_COMPLETED": false };

  try {
    const { status, rows } = await crud.getDataListFromTable("", "PRAY_LIST_TB", whereParse);
    if (status === -1) {
      console.error('Error Occured at "/share/list" - ', error);
      res.status(500).json({ message: 'error', error: "Fail to get list of information from PRAY_LIST_TB at /share/list" });
    }

    const { status: userInfoStatus, rows: userInfoRows } = await crud.getDataListFromTable("USER_EMAIL", "USER_TB", { USER_NO: userNo });
    if (userInfoStatus === -1) {
      console.error('Error Occured at "/share/list" - ', error);
      res.status(500).json({ message: 'error', error: "Fail to get user information from PRAY_LIST_TB at /share/list" });
    }

    res.status(200).json({ message: 'success', prayList: rows, userName: userInfoRows[0].USER_NAME });

  } catch (error) {
    console.error('Error Occured at "/share/list" - ', error);
    res.status(500).json({ message: 'error' });
  }
})


/**
* 기도제목 리스트
*/

router.get("/advice", async (req, res) => {
  const adviceToken = req.query.adviceToken;
  const adviceNo = common.decrypt(adviceToken);

  try {
    const { status, rows } = await crud.getDataListFromTable("", "AI_ADVICE_TB", { "ADVICE_NO": adviceNo });
    if (status === -1) {
      console.error('Error Occured at "/share/list" - ', error);
      res.status(500).json({ message: 'error', error: "Fail to get list of information from PRAY_LIST_TB at /share/list" });
    }

    const { status: userInfoStatus, rows: userInfoRows } = await crud.getDataListFromTable("USER_NAME", "USER_TB", { USER_NO: rows[0].USER_NO });
    if (userInfoStatus === -1) {
      console.error('Error Occured at "/share/list" - ', error);
      res.status(500).json({ message: 'error', error: "Fail to get user information from PRAY_LIST_TB at /share/list" });
    } else {
      res.status(200).json({ message: 'success', adviceInfo: rows[0], userName: userInfoRows[0].USER_NAME });
    }
  } catch (error) {
    console.error('Error Occured at "/share/list" - ', error);
    res.status(500).json({ message: 'error' });
  }
})




module.exports = router;
