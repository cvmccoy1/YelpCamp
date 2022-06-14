if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require('express');
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

// Connect and setup the mongo database
mongoose.connect("mongodb://localhost:27017/yelp-camp");
mongoose
    .connection
    .on("error", console.error.bind(console, "Connection error:"))
    .once("open", () => console.log("Database connected"));

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const oneWeekInMilliseconds = 1000 * 60 * 60 * 24 * 7;
const sessionConfig = {
    secret: "thissouldbeabettersecret!",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + oneWeekInMilliseconds,
        maxAge: oneWeekInMilliseconds
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Set up middle used on all requests
app.use((req, res, next) => {
    if (!["/", "/login"].includes(req.originalUrl)) {
        req.session.returnToUrl = req.originalUrl;
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// Set up the Express Routers (for user, campground, and review routes)
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

// Set up  the Home route handler
app.get("/", (req, res) => {
    res.render("home");
});

// Set up to catch all unknown routes
app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

// Set up middleware to handle all errors
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Unknown Error";
    res.status(statusCode).render("error", { err });
});

// Set up the listener
app.listen(3000, () => {
    console.log("Serving on Port 3000");
});