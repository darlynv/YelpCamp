// Require mongoose
const mongoose = require('mongoose');
// Variable for mongoose.Schema
const Schema = mongoose.Schema;

// Campground schema
const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String
});

// Export Campground model
module.exports = mongoose.model('Campground', CampgroundSchema);