if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}


const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const session = require('express-session')
const flash = require('connect-flash')
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')
const cors = require('cors')

const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user.js')

const mongoSanitize = require('express-mongo-sanitize')

const helmet = require('helmet')

const { campgroundSchema, reviewSchema } = require('./schemas.js')

const Campground = require('./models/campground')
const Review = require('./models/review')

const userRoutes = require('./routes/users.js')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')

const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')


const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'

mongoose.connect(dbUrl)

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected")
});

const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
// app.use(express.static('public'))
app.use(express.static(path.join(__dirname, 'public')))

app.use(cors())

// app.use(mongoSanitize())
app.use(mongoSanitize({
    replaceWith: '_'
}))

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use(helmet({
    // contentSecurityPolicy: false
}))

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const connectSrcUrls = [
    "https://api.maptiler.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dkkzaekid/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
                "https://api.maptiler.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize())  //always place passport uses after session uses
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    // console.log(req.session)
    // console.log(req.query)
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

// app.get('/fakeuser', async (req, res) => {
//     const user = new User({ email: 'colt@mail.com', username: 'colt123' })
//     const newUser = await User.register(user, 'chicken')
//     res.send(newUser)
// })

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    res.render('home')
})

app.all('*', (req, res, next) => {
    // res.send('404!!')
    next(new ExpressError('Page not found!', 404))
})

app.use((err, req, res, next) => {
    // const { message = 'something went wrong (default response)', statusCode = 500 } = err
    const { statusCode = 500 } = err
    if (!err.message) err.message = 'Oh no, something went wrong'
    res.status(statusCode).render('error', { err })
    // res.status(statusCode).send(message)
    // res.send('oh boy, something went wrong')
})

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})
