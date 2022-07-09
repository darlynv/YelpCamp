const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');

const Campground = require('../models/campground');

const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');


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
    // Set current user as campground author
    campground.author = req.user._id;
    // Save new campground with await
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    // Redirect to 'campgrounds/id' path
    res.redirect(`campgrounds/${campground._id}`);
}));


// Render 'show' page
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews').populate({
        // Populates review author through path
        path: 'reviews',
        populate: {
            path: 'author'
        }
    // Populates campground author
    }).populate('author');
    console.log(campground);
    // Pass campground variable to and render 'campgrounds/show' path
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));


// Render 'edit' page
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    // Pass campground variable to 'campgrounds/edit' path
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}));


// Update campground with server-side validation and error handling middleware
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    // Destructure id value from req.params
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body._id });
    req.flash('success', 'Successfully updated campground!');
    // Redirect to 'campgrounds/id' path
    res.redirect(`/campgrounds/${campground._id}`);
}));


// Find campground by id and delete it
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    // Get id value from req.params
    const { id } = req.params;
    const campground = await Campground.findById(id);
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successsfully deleted campground!');
    // Redirect to '/campgrounds' path
    res.redirect('/campgrounds');
}));

module.exports = router;