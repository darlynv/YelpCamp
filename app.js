// Requirements
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
// Ejs-mate allows for the sharing of HTML boilerplate between pages
const ejsMate = require('ejs-mate');
const session = require('express-session');
// Require Joi validation schemas
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressErrors');
const methodOverride = require('method-override');
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

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
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: 'thisisasecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 604800000,
        maxAge: 604800000
    }
}

app.use(session(sessionConfig));

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

// Render 'home' page
app.get('/', (req, res) => {
    res.render('home')
});

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