const express = require('express');
const router = express.Router({ mergeParams: true }); // Need mergeParams set because :id is specified in the App.js file, not this one
const reviews = require("../controllers/reviews");
const { isLoggedIn, isReviewAuthor, validateReview } = require("../middleware");

// All routes are prefixed with '/campgrounds/:id/reviews'
// CREATE
router.post("/", isLoggedIn, validateReview, reviews.create);
// DELETE/DESTROY
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, reviews.delete);

module.exports = router;