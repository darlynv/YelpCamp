if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
};
// Requirements
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
// Ejs-mate allows for the sharing of HTML boilerplate between pages
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
// Joi validation schemas
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressErrors');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

// Routes
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
// Connect to MongoDB database
mongoose.connect('mongodb://localhost:27017/yelp-camp');

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
// Use express.urlencoded on all incoming requests to be able to parse them
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
};
// session() must be used before passport.session()
app.use(session(sessionConfig));
app.use(flash());

// Required to initialize Passport
app.use(passport.initialize());
// Required for persistent login sessions
app.use(passport.session());
// Have Passport use LocalStrategy which will use authenticate method on User model
passport.use(new LocalStrategy(User.authenticate()));
// Serialize / store user in a session
passport.serializeUser(User.serializeUser());
// Deserialize / remove user from a session
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    // Give access to req.user to all templates
    res.locals.currentUser = req.user;
    // Middleware that passes whatever is under flash 'success' or 'error' and passes it to locals under the key 'success'or 'error'
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

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