const express = require("express");

//this will send the parameters to next routers as well
// const router = express.Router({ mergeParams: true });

const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");

const passport = require("passport");

const { saveRedirectUrl } = require("../middleware.js");

//M V C - controller
const userController = require("../controllers/users.js");

router.get("/signUp", userController.renderSignUpForm);

router.post("/signUp", wrapAsync(userController.signUp));

router.get("/login", userController.renderLoginForm);

router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.login,
);

router.get("/logout", userController.logout);
module.exports = router;
