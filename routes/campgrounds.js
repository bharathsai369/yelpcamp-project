const express = require('express')
const router = express.Router()

const Campground = require('../models/campground')

const catchAsync = require('../utils/catchAsync')

const { isLoggedIn, isAuthor, validateCampground } = require('../middleware')

const campgrounds = require('../controllers/campgrounds')

const multer = require('multer')
const { storage } = require('../cloudinary')
// const upload = multer({ dest: 'uploads/' })
const upload = multer({
    storage,
    limits: {
        files: 5,
        filesize: 5 * 1024 * 1024
    }
})

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn,
        upload.array('image'),
        validateCampground,
        catchAsync(campgrounds.createCampground))

// .post(isLoggedIn,
//     validateCampground,
//     catchAsync(campgrounds.createCampground))

// .post(upload.single('image'), (req, res) => {
// .post(upload.array('image'), (req, res) => {
//     // console.log(req.body, req.file)
//     // res.send(req.body, req.file)
//     // res.status(200).send(req.file);
//     // res.send({body:req.body,file:req.file});
//     console.log(req.body, req.files)
//     // res.send({ body: req.body, files: req.files });
//     res.send('success')
// })

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn,
        isAuthor,
        upload.array('image'),
        validateCampground,
        catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn,
        isAuthor,
        catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor,
    catchAsync(campgrounds.renderEditForm))

// router.get('/', catchAsync(campgrounds.index))

// router.get('/new', isLoggedIn, campgrounds.renderNewForm)

// router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))

// router.get('/:id', catchAsync(campgrounds.showCampground))

// router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

// router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))

// router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

// router.get('/makecampground', async (req,res)=>{
//     const camp = new Campground({title: 'My Backyard',
//  description:'cheap camping and comfortable shit'})
//     await camp.save()
//     res.send(camp)
// })

module.exports = router