const express = require("express");

//this will send the parameters to next routers as well
// const router = express.Router({ mergeParams: true });

const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");

const passport = require("passport");

router.get("/signUp", (req, res) => {
  res.render("users/signUp.ejs");
});

router.post(
  "/signUp",
  wrapAsync(async (req, res) => {
    try {
      let { username, email, password } = req.body;
      const newUser = new User({ username, email });
      const registerdUser = await User.register(newUser, password);
      console.log(registerdUser);
      req.flash("success", "Welcome to Stayora!");
      res.redirect("/listings");
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signUp");
    }
  }),
);

router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome back to Stayora!");
    res.redirect("/listings");
  },
);

module.exports = router;
