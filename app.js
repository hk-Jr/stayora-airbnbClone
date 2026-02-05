const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

const { listingSchema } = require("./schema.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/stayora";
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

//ejs-Mate
app.engine("ejs", ejsMate);

app.use(express.static(path.join(__dirname, "/public")));
app.get(
  "/",
  wrapAsync(async (req, res) => {
    res.send("HI, I am Root.");
  }),
);

//the whole JOI functionaities are added here -- interaction happening
const validateListings = (req, res, next) => {
  let { err } = listingSchema.validate(req.body);

  if (err) {
    let errMsg = err.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//index Route
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
  }),
);

//new Route
app.get(
  "/listings/new",
  wrapAsync(async (req, res) => {
    res.render("./listings/new.ejs");
  }),
);

//show Route
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/show.ejs", { listing });
  }),
);

//create Route
app.post(
  "/listings",
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

    res.redirect("/listings");
  }),
);

//edit Route
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs", { listing });
  }),
);

//update Route
app.put(
  "/listings/:id",
  validateListings,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  }),
);

//delete Route
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);

    res.redirect("/listings");
  }),
);

// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "my new Villa",
//     description: "by the seashore of the Goa",
//     price: 15000,
//     location: "india",
//     country: "india",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successfull testing");
// });

// catch-all for invalid routes (SAFE)
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// error handler
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { err });
  console.log("error handled:", err);
});

app.listen(8080, () => {
  console.log("listening on port:8080");
});
