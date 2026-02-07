const express = require("express");

//this will send the parameters to next routers as well
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const {
  validateReview,
  isLoggedIn,
  isReviewAuthor,
} = require("../middleware.js");

//M V C - controller
const reviewController = require("../controllers/reviews.js");

router
  .route("/")
  //reviews Route
  .post(isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

router
  .route("/:reviewId")
  //delete review Route
  .delete(isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;
