const express = require('express');
const common = require("../public/javascripts/common.js")
const crud = require("../model/crud.js");
const { getUserNo } = require('../model/user.js');
var router = express.Router();
require("dotenv").config();




/**
* 기도제목 정보
*/

router.get("/info", async (req, res) => {
  const prayNo = parseInt(req.query.prayNo);

  try {

    const { status, rows } = await crud.getDataListFromTable("PRAY_TEXT", "PRAY_LIST_TB", { "PRAY_NO": prayNo })
    if (status === -1) {
      console.error('Error Occured at "/pray/info" - ', error);
      res.status(500).json({ message: 'error', error: "Fail to get information from PRAY_LIST_TB at /pray/info" });
    }
    res.status(200).json({ message: 'success', prayInfo: rows[0].PRAY_TEXT });

  } catch (error) {
    console.error('Error Occured at "/pray/info" - ', error);
    res.status(500).json({ message: 'error' });
  }
})

/**
* 기도제목 리스트
*/

router.get("/list", async (req, res) => {
  const userNo = await getUserNo(req, res);
  const completed = req.query.done === "true" ? 1 : 0;
  let whereParse = { "USER_NO": userNo, "DELETED_AT": null };

  if (req.query.done != null) {
    whereParse = {
      ...whereParse,
      "PRAY_COMPLETED": completed
    }
  }

  try {
    const { status, rows } = await crud.getDataListFromTable("", "PRAY_LIST_TB", whereParse)
    if (status === -1) {
      console.error('Error Occured at "/pray/list" - ', error);
      res.status(500).json({ message: 'error', error: "Fail to get list of information from PRAY_LIST_TB at /pray/list" });
    }
    res.status(200).json({ message: 'success', prayList: rows });

  } catch (error) {
    console.error('Error Occured at "/pray/list" - ', error);
    res.status(500).json({ message: 'error' });
  }
})

/**
* 기도제목 응답
*/

router.post("/done", async (req, res) => {
  const prayNo = parseInt(req.body.prayNo);

  try {

    const { status } = await crud.updateData("PRAY_LIST_TB", { "PRAY_COMPLETED": 1 }, { "PRAY_NO": prayNo })
    if (status === -1) {
      console.error('Error Occured at "/pray/done" - ', error);
      res.status(500).json({ message: 'error', error: "Fail to set done information from PRAY_LIST_TB at /pray/done" });
    }
    res.status(200).json({ message: 'success' });


  } catch (error) {
    console.error('Error Occured at "/pray/done" - ', error);
    res.status(500).json({ message: 'error' });
  }

})


/**
* 기도제목 추가
*/

router.post("/add", async (req, res) => {
  const text = req.body.text;
  const userNo = await getUserNo(req, res);
  const prayObj = {
    USER_NO: userNo,
    PRAY_TEXT: text,
  }
  try {
    const { status } = await crud.createDataRow("PRAY_LIST_TB", prayObj)
    if (status === -1) {
      console.error('Error Occured at "/pray/add" - ', error);
      res.status(500).json({ message: 'error', error: "Fail to add information from PRAY_LIST_TB at /pray/add" });
    }
    res.status(200).json({ message: 'success' });


  } catch (error) {
    console.error('Error Occured at "/pray/add" - ', error);
    res.status(500).json({ message: 'error' });
  }
})

/**
* 기도제목 수정
*/

router.post("/update", async (req, res) => {
  const prayNo = req.body.prayNo;
  const prayText = req.body.text;
  try {
    const { status } = await crud.updateData("PRAY_LIST_TB", { "PRAY_TEXT": prayText }, { "PRAY_NO": prayNo })
    if (status === -1) {
      console.error('Error Occured at "/pray/update" - ', error);
      res.status(500).json({ message: 'error', error: "Fail to update text information from PRAY_LIST_TB at /pray/update" });
    }
    res.status(200).json({ message: 'success' });

  } catch (error) {
    console.error('Error Occured at "/pray/update" - ', error);
    res.status(500).json({ message: 'error' });
  }
})

/**
* 기도제목 삭제
*/

router.post("/delete", async (req, res) => {
  const prayNo = parseInt(req.body.prayNo);

  try {
    console.log('prayNo', prayNo)
    const { status } = await crud.updateData("PRAY_LIST_TB", { "UPDATED_AT": common.jsDateToMysqlDateTime(new Date()), "DELETED_AT": common.jsDateToMysqlDateTime(new Date()) }, { "PRAY_NO": prayNo })
    if (status === -1) {
      console.error('Error Occured at "/pray/delete" - ', error);
      res.status(500).json({ message: 'error', error: "Fail to update information from PRAY_LIST_TB at /pray/delete" });
    }
    res.status(200).json({ message: 'success' });

  } catch (error) {
    console.error('Error Occured at "/pray/delete" - ', error);
    res.status(500).json({ message: 'error' });
  }
})



module.exports = router;
