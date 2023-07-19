
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
