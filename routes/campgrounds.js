const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

// All routes are prefixed with '/campgrounds'

router.route("/")
    .get(campgrounds.index)
    .post(isLoggedIn, upload.array("images"), validateCampground, campgrounds.create);

router.get("/new", isLoggedIn, campgrounds.new);

router.route("/:id")
    .get(campgrounds.show)
    .patch(isLoggedIn, isAuthor, upload.array("images"), validateCampground, campgrounds.update)
    .delete(isLoggedIn, isAuthor, campgrounds.delete);

router.get("/:id/edit", isLoggedIn, isAuthor, campgrounds.edit);



module.exports = router;