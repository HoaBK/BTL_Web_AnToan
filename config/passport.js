/**
 * Created by Tran Quang Hieu on 4/17/2017.
 */
var LocalStrategy   = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');
var users = require('../app/models/user');

module.exports = function(passport) {
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        users.getUserById(id, function (err, rows) {
            done(err, rows);
        })
    });

    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-signup',
        new LocalStrategy({
                // by default, local strategy uses username and password, we will override with email
                usernameField : 'username',
                passwordField : 'password',
                passReqToCallback : true // allows us to pass back the entire request to the callback
            },
            function(req, username, password, done) {
                var name = req.body.name;
                var numberPhone = req.body.numberPhone;
                var address = req.body.address;
                var username = req.body.username;
                var password = req.body.password;



                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                users.getUserByUsername(username, function (err, rows) {
                    if (err)
                        return done(err);
                    if (rows.length) {
                        return done(null, false, req.flash('signupMessage', 'Tên đăng nhập đã tồn tại'));
                    } else {
                        // if there is no user with that username
                        // create the user
                        var newUser = {
                            name: name,
                            username: username,
                            numberPhone: numberPhone,
                            address: address,
                            password: password
                        };
                        users.setUserToDatabase(newUser, function (err, id) {
                            newUser.id = id;
                            return done(null, newUser);
                        });
                    }
                });
            })
    );


    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
                // by default, local strategy uses username and password, we will override with email
                usernameField : 'username',
                passwordField : 'password',
                passReqToCallback : true // allows us to pass back the entire request to the callback
            },
            function(req, username, password, done) { // callback with email and password from our form
                users.getUserByUsername(username, function (err, rows) {
                    if (err)
                        return done(err);
                    if (!rows.length) {
                        return done(null, false, req.flash('loginMessage', 'Tên đăng nhập không tồn tại.')); // req.flash is the way to set flashdata using connect-flash
                    }

                    // if the user is found but the password is wrong
                    if (!bcrypt.compareSync(password, rows[0].password))
                        return done(null, false, req.flash('loginMessage', 'Mật khẩu sai.')); // create the loginMessage and save it to session as flashdata

                    // all is well, return successful user
                    return done(null, rows[0]);
                });
            })

    );
};
