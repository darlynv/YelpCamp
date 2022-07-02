// Requirements
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
// Ejs-mate allows for the sharing of HTML boilerplate between pages
const ejsMate = require('ejs-mate');
// Joi allows for the validation of input data 
const Joi = require('joi');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressErrors');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
// Connect to MongoDB database
mongoose.connect('mongodb://localhost:27017/yelp-camp')

// Variable for mongoose.connection
const db = mongoose.connection;
// Display database connection status
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const app = express();

// Set engine as ejs-mate
app.engine('ejs', ejsMate);
// Set view engine as EJS
app.set('view engine', 'ejs');
// Set views directory for EJS
app.set('views', path.join(__dirname, 'views'));
// Use express.urlencoded on all incoming requests
app.use(express.urlencoded({ extended: true }));
// Use methodOverride, to include PUT and DELETE requests, on all incoming requests
app.use(methodOverride('_method'));

// Render 'home' page
app.get('/', (req, res) => {
    res.render('home')
});

// Render 'index' page
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    // Pass campgrounds value to and render 'campgrounds/index' path
    res.render('campgrounds/index', { campgrounds })
}));

// Render 'new' page
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

// --------------------
// Example of async error handling using try/catch: 
//Encapsulate function in try, and catch any errors and pass them into next()
// Create a new campground
// app.post('/campgrounds', async (req, res, next) => {
//     try {
//     const campground = new Campground(req.body.campground);
//     // Save new campground with await
//     await campground.save();
//     // Redirect to 'campgrounds/id' path
//     res.redirect(`campgrounds/${campground._id}`);
//     // If error is thrown, catch and forward to next
//     } catch (e) {
//         next(e);
//     }
// });
// --------------------

// Example of async error handling with custom wrapper function
app.post('/campgrounds', catchAsync(async (req, res, next) => {
    // Define Joi schema with required keys and values
    const campgroundSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),
            price: Joi.number().required().min(0),
            image: Joi.string().required(),
            location: Joi.string().required(),
            description: Joi.string().required()
        }).required()
    })
    // Pass data to Joi schema and destructure error from req.body 
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        // Since error.details is an array of objects, map over each el.message and join with ',' if more than one element, and return a string 'msg'
        const msg = error.details.map(el => el.message).join(',')
        // Throw new Express error with 'msg'
        throw new ExpressError(msg, 400)
    }
    // Create a new campground
    const campground = new Campground(req.body.campground);
    // Save new campground with await
    await campground.save();
    // Redirect to 'campgrounds/id' path
    res.redirect(`campgrounds/${campground._id}`);
}));

// Render 'show' page
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    // Pass campground variable to and render 'campgrounds/show' path
    res.render('campgrounds/show', { campground });
}));

// Render 'edit' page
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    // Pass campground variable to 'campgrounds/edit' path
    res.render('campgrounds/edit', { campground });
}));

// Search campground by id and update it
app.put('/campgrounds/:id', catchAsync(async (req, res) => {
    // Destructure id value from req.params
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    // Redirect to 'campgrounds/id' path
    res.redirect(`/campgrounds/${campground._id}`)
}));

// Find campground by id and delete it
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    // Redirect to '/campgrounds' path
    res.redirect('/campgrounds');
}));

// For every request and every path that doesn't exist, this will run
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
});

// Error handler that will run whenever an error is thrown
app.use((err, req, res, next) => {
    // Destructure statusCode and message from thrown error and set default values if none provided
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oops, something went wrong.'
    res.status(statusCode).render('error', { err });
});

// Listen for incoming requests on port 3000
app.listen(3000, () => {
    console.log('Serving on port 3000')
});