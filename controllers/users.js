const User = require("../models/user.js");

module.exports.renderSignUpForm = (req, res) => {
  res.render("users/signUp.ejs");
};

module.exports.signUp = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ username, email });
    const registerdUser = await User.register(newUser, password);
    console.log(registerdUser);

    //to automatically log in the user after signing up
    req.login(registerdUser, (err) => {
      if (err) {
        return next(err);
      }
    });
    req.flash("success", "Welcome to Stayora!");
    res.redirect("/listings");
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signUp");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to Stayora!");

  res.redirect(res.locals.redirectUrl || "/listings"); //for better UX, /listing is default page.
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You have logged out!");
    res.redirect("/listings");
  });
};
