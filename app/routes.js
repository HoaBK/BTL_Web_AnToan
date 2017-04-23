/**
 * Created by Tran Quang Hieu on 4/17/2017.
 */
// app/routes.js
var multer = require('multer');
var photo = require('./models/photo');
var path = require('path');

module.exports = function(app, passport) {
    // app.get('/', function(req, res) {
    //     res.render('index.ejs'); // load the index.ejs file
    // });
    // show the login form
    app.get('/', isLoggedIn, function (req, res) {
        photo.getNewPhoto(function (err, photoList) {
            res.render('index.ejs', {isLoggedIn: false, items: photoList});
        });
        //res.render('index.ejs', {isLoggedIn: false});
    });

    app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });
    // process the login form
    app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }),
        function(req, res) {
            if (req.body.remember) {
                req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
                req.session.cookie.expires = false;
            }
            res.redirect('/');
        });
    // show the signup form
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });
    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedInProfile, function(req, res) {
        res.render('profile.ejs', {
            user : req.user, // get the user out of session and pass to template
            isLoggedIn: true
        });
    });
    app.get('/uploadImage', isLoggedInProfile,function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('uploadImage.ejs', {
            user : req.user, // get the user out of session and pass to template
            isLoggedIn: true
        });
    });

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "./public/upload");
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname+ "-" + Date.now() + path.extname(file.originalname));
        }
    });

    var upload = multer({storage: storage});

    app.post("/uploadImage", upload.single("image") , function (req, res) {
        var newImage = {
            title: req.body.title,
            image: "/upload/" + req.file.filename,
            date: Date.now(),
            name: req.body.name,
            userID: req.body.userID
        };
        photo.setPhotoToDatabase(newImage, function (err, id) {
            res.redirect('/');
        });
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        photo.getNewPhoto(function (err, photoList) {
            res.render('index.ejs', {user: req.user, isLoggedIn: true, items: photoList});
        });
        //res.render('index.ejs', {user: req.user, isLoggedIn: true});
    } else {
        next();
    }
}

// route middleware to make sure
function isLoggedInProfile(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the home page
    res.redirect('/');
}
