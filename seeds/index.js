const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
// Connect to MongoDB database
mongoose.connect('mongodb://localhost:27017/yelp-camp')

// Variable for mongoose.connection
const db = mongoose.connection;
// Display database connection status
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

// Functions for generating random names from seedHelpers arrays
const sample = (array) => array[Math.floor(Math.random() * array.length)];

// Generate random campgrounds and save to database
const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Et cumque cupiditate expedita magnam sequi hic aperiam perspiciatis reiciendis, nulla, odio aliquid maiores. Quas tempora sequi corporis iusto omnis sit nihil.',
            price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})