const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

module.exports.index = catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
});

module.exports.new = (req, res) => {
    res.render("campgrounds/new");
};

module.exports.create = catchAsync(async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(file => ({ url: file.path, filename: file.filename }));
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Successfully created a new campground.");
    res.redirect(`/campgrounds/${campground._id}`);
});

module.exports.show = catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
        .populate(
            {
                path: "reviews",
                populate: { path: "author" }
            })
        .populate("author");
    if (!campground) {
        req.flash("error", "Unable to find campground.");
        res.redirect("/campgrounds");
    }
    else {
        res.render("campgrounds/show", { campground });
    }
});

module.exports.edit = catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash("error", "Unable to find campground to edit.");
        res.redirect("/campgrounds");
    }
    else {
        res.render("campgrounds/edit", { campground });
    }
});

module.exports.update = catchAsync(async (req, res) => {
    const { id } = req.params;
    const new_images = req.files.map(file => ({ url: file.path, filename: file.filename }));

    ////const campground = await Campground.findByIdAndUpdate(id, { "title": req.body.campground.title, "location": req.body.campground.location });
    //// Use spread operator '...' as shortcut for previous statement
    //const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    //campground.images.push(...new_images);
    //await campground.save();

    const campground = await Campground.findById(id);
    Object.assign(campground, { ...req.body.campground });
    campground.images.push(...new_images);

    if (req.body.deleteImages) {
        //await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
        req.body.deleteImages.forEach(filename => {
            const index = campground.images.findIndex(image => image.filename === filename);
            if (index >= 0) campground.images.splice(index, 1);
        });
        // for (let filename of req.body.deleteImages) {
        //     await cloudinary.uploader.destroy(filename);
        // }
        await cloudinary.api.delete_resources(req.body.deleteImages);
    }
    await campground.save();
    req.flash("success", "Successfully updated campground.");
    res.redirect(`/campgrounds/${campground._id}`);
});

module.exports.delete = catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground.");
    res.redirect("/campgrounds");
});