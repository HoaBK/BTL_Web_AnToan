/**
 * Created by Tran Quang Hieu on 4/18/2017.
 */
var connection = require('../../config/database').connection;
var bcrypt = require('bcrypt-nodejs');

function getUserById (id, callback) {
    connection.query("SELECT * FROM user WHERE id = ? ",[id], function(err, rows){
        callback(err, rows[0]);
    });
}

function getUserByUsername(username, callback) {
    connection.query("SELECT * FROM user WHERE username = ?",[username], function(err, rows) {
        callback(err, rows);
    });
}

function setUserToDatabase(newUser, callback) {
    var name = newUser.name;
    var numberPhone = newUser.numberPhone;
    var address = newUser.address;
    var username = newUser.username;
    var passwordHash = bcrypt.hashSync(newUser.password, null, null);

    var insertQuery = "INSERT INTO user ( name, numberPhone, address,username, password ) values (?, ?, ?, ?, ?)";

    connection.query(insertQuery,[name, numberPhone,address, username, passwordHash],function(err, rows) {
        if (err) {
            console.log(err);
        } else {
            var id = rows.insertId;
            callback(err, id);
        }
    });
}

module.exports.getUserById = getUserById;
module.exports.getUserByUsername = getUserByUsername;
module.exports.setUserToDatabase = setUserToDatabase;