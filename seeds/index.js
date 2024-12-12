const { default: mongoose } = require('mongoose')
const Campground = require('../models/campground')
// const cities = require('./cities')
const cities = require('./cities-copy')
const { places, descriptors } = require('./seedHelpers')

mongoose.connect('mongodb://localhost:27017/yelp-camp')

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected")
});

const sample = arr => arr[Math.floor(Math.random() * arr.length)]

const seedDB = async () => {
    await Campground.deleteMany({})
    // const c = new Campground({title:'purple fields'})
    // await c.save()
    for (let i = 0; i < 200; i++) {
        // const rand1000 = Math.floor(Math.random() * 1000)
        const rand1000 = Math.floor(Math.random() * 500)
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            author: '6753db8d65abc172fbcf1a34',//your user ID
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[rand1000].longitude,
                    cities[rand1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dkkzaekid/image/upload/v1733675757/YelpCamp/pib3av5idw7sehi9diuw.jpg',
                    filename: 'YelpCamp/pib3av5idw7sehi9diuw',
                },
            ],
            price,
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Explicabo ipsum corrupti quis praesentium obcaecati, eius dolorum neque hic laborum tenetur reprehenderit, eligendi iste quod illo provident consectetur vel facere quaerat!'
        })
        await camp.save()
    }
}
seedDB().then(() => mongoose.connection.close())