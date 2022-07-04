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
    location: String,
    // Reviews are an array of IDs from the Review model schema
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

// Export Campground model
module.exports = mongoose.model('Campground', CampgroundSchema);