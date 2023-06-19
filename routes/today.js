const express = require('express');
const common = require('../public/javascripts/common');
const crud = require("../public/javascripts/crud")
var router = express.Router();

require("dotenv").config();


router.get("/words", async (req, res) => {
  try {
    const {status, rows} = await crud.getDataListFromTable("", "WORDS_OF_TODAY_TB", { "REGISTRATION_DT": new Date() })
    if (status === -1) {
      console.error('Error Occured at "/today/words" - ', error);
      res.status(500).json({ message: 'error', error: "Fail to get information from WORDS_OF_TODAY_TB at /today/words" });
    } else {
      res.status(200).json({ message: 'success', words: rows[0]});
    }
  } catch (error) {
    console.error('Error Occured at "/today/words" - ', error);
    res.status(500).json({ message: 'error' });
  }

});


module.exports = router

