const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users');


router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    // Built in passport middleware that authenticates user ... 'keepSessionInfo: true' necessary for returnTO functionality as of Passport 0.6.0
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), catchAsync(users.login));

router.get('/logout', users.logout);

module.exports = router;