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
        // Log in registered user
        req.login(registeredUser, err => {
            if (err) return next(e);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

// Render login page
router.get('/login', (req, res) => {
    res.render('users/login');
});

// Built in passport middleware that authenticates user ... 'keepSessionInfo: true' necessary for returnTO functionality as of Passport 0.6.0
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true}), catchAsync(async (req, res) => {
    req.flash('success', 'Welcome back!');
    // redirectUrl = original URL, or /campgrounds if it does not exist
    const redirectUrl = req.session.returnTo || '/campgrounds';
    // Delete redirectUrl from session after it is used
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}));

router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success', 'Successfully logged out');
        res.redirect('/campgrounds');
    });
});

module.exports = router;