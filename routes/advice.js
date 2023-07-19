
const express = require('express');
const crud = require("../model/crud.js")
var router = express.Router();


require("dotenv").config();


// 루트 엔드포인트
router.post('/save', async (req, res) => {
  const adviceInfo = req.body;
  try {
    const { status } = await crud.createDataRow("AI_ADVICE_TB", { "ADVICE_TXT": adviceInfo.advice.replace(/"/g, '\\"') , "QUESTION": adviceInfo.question ,  "USER_NO": 0})
    if (status === -1) {
      console.error('Error Occured at "/advice/save" - ', error);
      res.status(500).json({ message: 'error', error: "Fail to add information from PRAY_LIST_TB at /advice/save" });
    }
    res.status(200).json({ message: 'success' });

  } catch (error) {
    console.error('Error Occured at "/advice/save" - ', error);
    res.status(500).json({ message: 'error' });
  }
});

module.exports = router