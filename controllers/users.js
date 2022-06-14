const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");

module.exports.new = (req, res) => {
    res.render("users/register");
};

module.exports.create = catchAsync(async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, error => {
            if (!error) {
                req.flash("success", `Welcome ${username} to Yelp Campgrounds`);
                res.redirect("/campgrounds");
            }
            else {
                next(error);
            }
        });
    } catch (error) {
        req.flash("error", error.message);
        res.redirect("/register");
    }
});

module.exports.renderLogin = (req, res) => {
    res.render("users/login");
};

module.exports.login = (req, res) => {
    req.flash("success", `Welcome back ${req.user.username} to Yelp Campgrounds`);
    const { returnToUrl = "/campgrounds" } = req.session;
    delete req.session.returnToUrl;
    res.redirect(returnToUrl);
};

module.exports.logout = (req, res) => {
    req.logout();
    req.flash("success", "Goodbye!")
    res.redirect("/campgrounds");
};