// Use the env file only in DEV
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Get all required packages
const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");

const methodOverride = require("method-override");

// Initialise App
const app = express();

const initializePassport = require("./passport-config");

initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);

// This will be saved on database, for our reference just save it in local var
const users = [];

// // Tell app to use ejs view-engine
// app.set("view-engine", "ejs");

// // Tell express to accepet json from POST requests
// // Post requests must contain content-type as "application/json"
// app.use(express.urlencoded({ extended: false }));
// // app.use(express.json());

app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.use(express.json());

// Tell express to use flash and session
// Flash is an extension of connect-flash with the ability to
//  define a flash message and render it without redirecting the request.
app.use(flash());
app.use(
  session({
    // secret encrypts the session details
    secret: process.env.SESSION_SECRET,
    // resave is if we want to save to the session if nothing is changes
    resave: false,
    // saveUninitialized is if we want to save empty values
    saveUninitialized: false,
  })
);

// So basically passport.initialize() initialises the authentication module.
// In a Connect or Express-based application, passport.initialize()
//  middleware is required to initialize Passport. If your application
//  uses persistent login sessions, passport.session()
//   middleware must also be used
app.use(passport.initialize());
app.use(passport.session());

// useful for ejs to call delete method as form dont support delete
// here by using method ovveride package
// we telling that we will overide any method like :post or get
// the specified _method
// ex: action="/logout?_method=DELETE" method="POST"
// heere we are over riding post with delete
app.use(methodOverride("_method"));

// Make routes
app.get("/", checkAuthentication, (req, res) => {
  res.render("index.ejs", { name: req.user.name });
  // res.send("hello there");
});

app.get("/users", (req, res) => {
  res.status(200).send(users);
});

// Login route
app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

// Register route
app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});

// Handle data from views
// Hand over to passport on login
// authenticate takes which strategy and other details
app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    // Shows users the failure messages
    failureFlash: true,
  })
);

app.post("/register", checkNotAuthenticated, async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({
      id: Date.now().toString(),
      name: name,
      email: email,
      hashedPassword,
    });
    res.redirect("/login");
    // res.status(201).send("user succeefully created!!");
  } catch (error) {
    // res.status(500).send("Something went wrong!!");
    res.redirect("/register");
  }
  console.log("AFTER PSHING TO USERS", users);
});

// Specify Port
const PORT = 3000 || process.env.PORT;

// Middleware function that us called on routes to check if the user is authentcate

function checkAuthentication(req, res, next) {
  // Passport provides a built in isAuthenticated function to check if user authenticated
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/login");
}

// delete user
app.delete("/logout", (req, res) => {
  // Passport provides logout method to destroy the user session
  req.logOut();
  res.redirect("/login");
});

// Logged in users shouldnt access login or register page
function checkNotAuthenticated(req, res, next) {
  // If user is authenticated get redirect them to login page
  // else continue
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

// Make server
app.listen(PORT, () => console.log(`APP IS UP AND RUNNING ON PORT ${PORT}`));
