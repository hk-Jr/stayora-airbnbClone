const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review");

const { listingSchema, reviewSchema } = require("./schema.js");

//middleware to check if user is logged in or not

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    //storing the url that user redirects
    req.session.redirectUrl = req.originalUrl;

    req.flash("error", "You must be logged in to do that");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  //checking list authorization
  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You do not have permission to edit this listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListings = (req, res, next) => {
  //the whole JOI functionaities are added here -- interaction happening
  let { error } = listingSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  //the whole JOI functionaities are added here -- interaction happening
  let { error } = reviewSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);

  // Check if review exists
  if (!review) {
    req.flash("error", "Review not found");
    return res.redirect(`/listings/${id}`);
  }
  // Check if user is authenticated
  if (!req.user) {
    req.flash("error", "You must be logged in");
    return res.redirect("/login");
  }
  // Check if user is the author
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to delete this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
