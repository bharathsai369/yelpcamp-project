const Campground = require('../models/campground')
const { cloudinary } = require('../cloudinary')

const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    // const geoData = await maptilerClient.geocoding.forward('Kyoto, Japan', { limit: 1 });
    // const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    // console.log(geoData)
    // console.log(geoData.type)
    // // console.log(geoData.features)
    // console.log(geoData.features[0].geometry)
    // console.log(geoData.features[0].geometry.coordinates)
    // res.send('OK!!')

    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    if (campground.images.length > 10) {
        req.flash('error', 'Max images allowed: 10!');
        res.redirect(`/campgrounds/${id}`)
    } else {
        campground.author = req.user._id
        await campground.save()
        console.log(campground)
        req.flash('success', 'Successfully created a new campground!')
        res.redirect(`/campgrounds/${campground._id}`)
    }
}

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: { path: 'author' }
    }).populate('author')
    // console.log(campground)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params
    console.log(req.body)
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    campground.geometry = geoData.features[0].geometry;
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    if ((campground.images.length + imgs.length) > 10) {
        req.flash('error', 'Max images allowed: 10!');
        res.redirect(`/campgrounds/${id}`);
    } else {
        campground.images.push(...imgs)
        await campground.save()
        console.log(campground)
        if (req.body.deleteImages) {
            for (let filename of req.body.deleteImages) {
                await cloudinary.uploader.destroy(filename)
            }
            await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
            // console.log(campground)
        }
        req.flash('success', 'Successfully updated the campground!')
        res.redirect(`/campgrounds/${campground._id}`)
        // res.send('it worked')
    }
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted a campground!')
    res.redirect(`/campgrounds`)
}