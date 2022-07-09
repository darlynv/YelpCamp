const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users');


router.get('/register', users.renderRegister);

router.post('/register', catchAsync(users.register));

router.get('/login', users.renderLogin);

// Built in passport middleware that authenticates user ... 'keepSessionInfo: true' necessary for returnTO functionality as of Passport 0.6.0
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), catchAsync(users.login));

router.get('/logout', users.logout);

module.exports = router;