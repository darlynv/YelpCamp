// Require mongoose
const mongoose = require('mongoose');
// Require review model for deleting corresponding reviews when deleting campground
const Review = require('./review');
// Variable for mongoose.Schema
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

// Create virtual property for thumbnail that changes url to set thumbnail width for templates using cloudinary transform API
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});


const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
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