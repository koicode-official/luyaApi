var express = require('express');
var router = express.Router();
var chatRouter = require("./chat.js");
var prayRouter = require("./pray.js");
var todayRouter = require('./today.js')
var adviceRotuer = require("./advice.js");

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use("/chat", chatRouter);
router.use("/pray", prayRouter);
router.use("/today", todayRouter);
router.use("/advice", adviceRotuer);



module.exports = router;
