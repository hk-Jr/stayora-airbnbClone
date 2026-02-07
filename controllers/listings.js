const Listing = require("../models/listing.js");

//geocoding
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("./listings/index.ejs", { allListings });
};

module.exports.renderNewForm = async (req, res) => {
  res.render("./listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing was not found");
    return res.redirect("/listings");
  }

  res.render("./listings/show.ejs", {
    listing,
    mapToken: process.env.MAPBOX_TOKEN, // ✅ Pass the token to the view
  });
};

module.exports.createListing = async (req, res) => {
  //for geocoding
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  let url = req.file.path;
  let fileName = req.file.filename;

  const newListing = await new Listing(req.body.listing);

  newListing.owner = req.user._id; //looged in user is new listing owner.
  newListing.image = { url, fileName };

  newListing.geometry = response.body.features[0].geometry;

  let savedListing = await newListing.save();

  req.flash("success", "New Listing created");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  //if listing do not exist
  if (!listing) {
    req.flash("error", "Listing was not found");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250"); //to render the image in smaller size in edit form

  res.render("./listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let fileName = req.file.filename;
    listing.image = { url, fileName };

    await listing.save();
  }

  req.flash("success", "Listing updated");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id); //in listing.js a middleware will automatically be called
  console.log(deletedListing);
  req.flash("success", "Listing deleted");
  res.redirect("/listings");
};
