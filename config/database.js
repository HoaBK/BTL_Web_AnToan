/**
 * Created by Tran Quang Hieu on 4/17/2017.
 */
// config/database.js
var mysql = require("mysql");
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "photoshare"
});

connection.connect();

module.exports.connection = connection;