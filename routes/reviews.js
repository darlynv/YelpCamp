const express = require('express');
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utils/catchAsync');

const Campground = require('../models/campground');
const Review = require('../models/review');

const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');


// Post review with server-side validation and error handling middleware
router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    // Request campground by ID
    const campground = await Campground.findById(req.params.id);
    // Create new review
    const review = new Review(req.body.review);
    // Set current user as review author
    review.author = req.user.id;
    // Push review
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    // Redirect back to campground show page
    res.redirect(`/campgrounds/${campground._id}`);
}));


router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    // Get campground id and review id from req.params
    const { id, reviewId } = req.params;
    // Use mongo $pull to remove all instances of specific id from reviews array
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;