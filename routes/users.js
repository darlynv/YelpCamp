const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

router.get('/register', (req, res) => {
    res.render('users/register');
});

// Register new user
router.post('/register', catchAsync(async (req, res) => {
    try {
        // Get email, username, and password from request body
        const { email, username, password } = req.body;
        // Pass email and username to a new user
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        console.log(registeredUser);
        req.flash('success', 'Welcome to Yelp Camp!');
        res.redirect('/campgrounds');
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

// Render login page
router.get('/login', (req, res) => {
    res.render('users/login');
});

// Built in passport middleware that authenticates user
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login'}), catchAsync(async (req, res) => {
    req.flash('success', 'Welcome back!');
    res.redirect('/campgrounds');
}));

router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success', 'Successfully logged out');
        res.redirect('/campgrounds');
    });
});

module.exports = router;