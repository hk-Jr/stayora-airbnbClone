const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");

//logged in or not middleware
const { isLoggedIn, isOwner, validateListings } = require("../middleware.js");

const listingController = require("../controllers/listings.js");

const multer = require("multer");

const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

//M V C - Controller

router
  .route("/")
  //index Route
  .get(wrapAsync(listingController.index))
  //create Route
  .post(
    isLoggedIn,
    validateListings,
    upload.single("listing[image]"),
    wrapAsync(listingController.createListing),
  );

//new Route
router.get("/new", isLoggedIn, wrapAsync(listingController.renderNewForm));

router
  .route("/:id")
  //show Route
  //added populate to render the other review collection data
  .get(wrapAsync(listingController.showListing))
  //update Route
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListings,
    wrapAsync(listingController.updateListing),
  )
  //delete Route
  //added IF any listings are deleted then review array must also be deletd
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

//edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm),
);

module.exports = router;
