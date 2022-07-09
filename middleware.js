const { campgroundSchema, reviewSchema } = require('./schemas');
const Campground = require('./models/campground');
const Review = require('./models/review');
const ExpressError = require('./utils/ExpressErrors');


module.exports.validateCampground = (req, res, next) => {
    // Pass data to Joi schema and destructure error from req.body 
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        // Since error.details is an array of objects, map over each el.message and join with ',' if more than one element, and return a string 'msg'
        const msg = error.details.map(el => el.message).join(',');
        // Throw new Express error with 'msg'
        throw new ExpressError(msg, 400);
        // If no error, pass as middleware
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }  else {
        next();
    }
};

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be logged in');
        return res.redirect('/login');
    }
    next();
};

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(id);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};