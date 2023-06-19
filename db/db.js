const mysql = require("mysql2/promise");
module.exports =  mysql.createPool({
  // connectionLimit: 10,
  // acquireTimeout: 10000,
  host: "testdatabase01.cpnjqsnkslax.ap-northeast-2.rds.amazonaws.com",
  port: 3306,
  user: "admin",
  password: "koidev0102!!",
  database: "testdatabase01",
  dateStrings: true
});;

