const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");

//the whole JOI functionaities are added here -- interaction happening
const validateListings = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//index Route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
  }),
);

//new Route
router.get(
  "/new",
  wrapAsync(async (req, res) => {
    res.render("./listings/new.ejs");
  }),
);

//show Route
//added populate to render the other review collection data
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");

    //if listing do not exist
    if (!listing) {
      req.flash("error", "Listing was not found");
      return res.redirect("/listings"); //Added 'return'
    }
    res.render("./listings/show.ejs", { listing });
  }),
);

//create Route
router.post(
  "/",
  validateListings,
  wrapAsync(async (req, res) => {
    // if (!req.body.listing) {
    //   throw new ExpressError("send valid data for Listing", 400);
    // }

    let result = listingSchema.validate(req.body);
    console.log(result);

    if (result.error) {
      throw new ExpressError(400, result.error);
    }
    const newListing = await new Listing(req.body.listing);
    await newListing.save();

    req.flash("success", "New Listing created");

    res.redirect("/listings");
  }),
);

//edit Route
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    //if listing do not exist
    if (!listing) {
      req.flash("error", "Listing was not found");
      return res.redirect("/listings");
    }
    res.render("./listings/edit.ejs", { listing });
  }),
);

//update Route
router.put(
  "/:id",
  validateListings,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    //if listing do not exist
    if (!listing) {
      req.flash("error", "Listing was not found");
      return res.redirect("/listings");
    }
    req.flash("success", "Listing updated");
    res.redirect(`/listings/${id}`);
  }),
);

//delete Route
//added IF any listings are deleted then review array must also be deletd
router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id); //in listing.js a middleware will automatically be called
    console.log(deletedListing);
    req.flash("success", "Listing deleted");
    res.redirect("/listings");
  }),
);

module.exports = router;
