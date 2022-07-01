// Requirements
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
// Ejs-mate allows you to share HTML boilerplate between pages
const ejsMate = require('ejs-mate');
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
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    // Pass campgrounds value to and render 'campgrounds/index' path
    res.render('campgrounds/index', { campgrounds })
});

// Render 'new' page
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

// Create a new campground
app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground);
    // Save new campground with await
    await campground.save();
    // Redirect to 'campgrounds/id' path
    res.redirect(`campgrounds/${campground._id}`);
});

// Render 'show' page
app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    // Pass campground variable to and render 'campgrounds/show' path
    res.render('campgrounds/show', { campground });
});

// Render 'edit' page
app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    // Pass campground variable to 'campgrounds/edit' path
    res.render('campgrounds/edit', { campground });
});

// Search campground by id and update it
app.put('/campgrounds/:id', async (req, res) => {
    // Destructure id value from req.params
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{ ...req.body.campground });
    // Redirect to 'campgrounds/id' path
    res.redirect(`/campgrounds/${campground._id}`)
});

// Find campground by id and delete it
app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    // Redirect to '/campgrounds' path
    res.redirect('/campgrounds');
});


// Listen for incoming requests on port 3000
app.listen(3000, () => {
    console.log('Serving on port 3000')
});