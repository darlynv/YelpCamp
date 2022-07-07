const express = require('express');
const router = express.Router();

const { campgroundSchema } = require('../schemas');

const ExpressError = require('../utils/ExpressErrors');
const catchAsync = require('../utils/catchAsync');

const Campground = require('../models/campground');

const {isLoggedIn} = require('../middleware');


// Campground validation middleware using Joi
const validateCampground = (req, res, next) => {
    // Pass data to Joi schema and destructure error from req.body 
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        // Since error.details is an array of objects, map over each el.message and join with ',' if more than one element, and return a string 'msg'
        const msg = error.details.map(el => el.message).join(',')
        // Throw new Express error with 'msg'
        throw new ExpressError(msg, 400)
        // If no error, pass as middleware
    } else {
        next();
    }
};


// Render 'index' page
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    // Pass campgrounds value to and render 'campgrounds/index' path
    res.render('campgrounds/index', { campgrounds })
}));


// Render 'new' page
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});


// Add campground with server-side validation and error handling middleware
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    // Create a new campground
    const campground = new Campground(req.body.campground);
    // Save new campground with await
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    // Redirect to 'campgrounds/id' path
    res.redirect(`campgrounds/${campground._id}`);
}));


// Render 'show' page
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    // Pass campground variable to and render 'campgrounds/show' path
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));


// Render 'edit' page
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    // Pass campground variable to 'campgrounds/edit' path
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}));


// Update campground with server-side validation and error handling middleware
router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    // Destructure id value from req.params
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully updated campground!');
    // Redirect to 'campgrounds/id' path
    res.redirect(`/campgrounds/${campground._id}`)
}));


// Find campground by id and delete it
router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    // Get id value from req.params
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successsfully deleted campground!');
    // Redirect to '/campgrounds' path
    res.redirect('/campgrounds');
}));

module.exports = router;