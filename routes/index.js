var express = require('express');
var router = express.Router();
var chatRouter = require("./chat.js");
var prayRouter = require("./pray.js");
var shareRouter = require("./share.js");
var todayRouter = require('./today.js')
var adviceRotuer = require("./advice.js");
var loginRouter = require("./login.js");
var authPhoneRouter = require("./authPhone.js");
var userRouter = require("./user.js");
var signupRouter= require("./signup.js");
var auth = require("../middleware/auth.js")

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

//no auth
router.use("/chat", chatRouter);
router.use("/today", todayRouter);
router.use("/login", loginRouter);
router.use("/authPhone", authPhoneRouter);
router.use("/share", shareRouter);
router.use("/signup", signupRouter);


//auth
router.use("/advice", auth ,adviceRotuer);
router.use("/user", auth,userRouter);
router.use("/pray", auth, prayRouter);



module.exports = router;
