const express = require('express');
const router = express.Router({ mergeParams: true });

const { reviewSchema } = require('../schemas.js');

const ExpressError = require('../utils/ExpressErrors');
const catchAsync = require('../utils/catchAsync');

const Campground = require('../models/campground');
const Review = require('../models/review');


// Review validation middleware using Joi
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
};


// Post review with server-side validation and error handling middleware
router.post('/', validateReview, catchAsync(async (req, res) => {
    // Request campground by ID
    const campground = await Campground.findById(req.params.id);
    // Create new review
    const review = new Review(req.body.review);
    // Push review
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    // Redirect back to campground show page
    res.redirect(`/campgrounds/${campground._id}`);
}));


router.delete('/:reviewId', catchAsync(async (req, res) => {
    // Get campground id and review id from req.params
    const { id, reviewId } = req.params;
    // Use mongo $pull to remove all instances of specific id from reviews array
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;