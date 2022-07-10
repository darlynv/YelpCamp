// Require mongoose
const mongoose = require('mongoose');
// Require review model for deleting corresponding reviews when deleting campground
const Review = require('./review');
// Variable for mongoose.Schema
const Schema = mongoose.Schema;

// Campground schema
const CampgroundSchema = new Schema({
    title: String,
    images: [
        {
            url: String,
            filename: String
        }
    ],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
    ref: 'User'
    },
    // Reviews are an array of IDs from the Review model schema
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

// Use mongoose middleware to delete corresponding reveiws when deleting campground
// Deleted document will be passed to the function and can be accessed as doc
// findByIdAndDelete will call findOneAndDelete mongoose middleware, so be cognisant of which deleting method is used
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    // If something was found and deleted...
    if (doc) {
        // Delete review IDs found in doc.reviews array
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
});

// Export Campground model
module.exports = mongoose.model('Campground', CampgroundSchema);