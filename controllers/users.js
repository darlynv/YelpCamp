const User = require('../models/user');


module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

module.exports.register = async (req, res) => {
    try {
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
};

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

module.exports.login = async (req, res) => {
    req.flash('success', 'Welcome back!');
    // redirectUrl = original URL, or /campgrounds if it does not exist
    const redirectUrl = req.session.returnTo || '/campgrounds';
    // Delete redirectUrl from session after it is used
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        req.flash('success', 'Successfully logged out');
        res.redirect('/campgrounds');
    });
};
