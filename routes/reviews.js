const express = require('express')
const router = express.Router({ mergeParams: true })

const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')

const Campground = require('../models/campground')
const Review = require('../models/review')

const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')

const { reviewSchema } = require('../schemas')
const { createReview, deleteReview } = require('../controllers/reviews')

const reviews = require('../controllers/reviews')

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router