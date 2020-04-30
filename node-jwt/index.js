// We will create new server for logn functionality
// Authserver.js will only deal with login,generating tokens, refresh tokens etc

// Both services will run independently but jwt can be shared btw

require("dotenv").config();

const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const POSTS = [
  {
    username: "Manoj",
    title: "Manoj Title",
  },
  {
    username: "Reddy",
    title: "Reddy Title",
  },
];

// Routes

app.get("/", (req, res) => {
  res.status(200).send("Hey guys");
});

// Create a JSON WEB TOKEN (JWT) WHEN USER LOGIN SUCCESSFULLY

// app.post("/login", (req, res) => {
//   // Creating JWT is very simple
//   // we need to call jwt.sign() and pass payload and secret
//   // we will store our secret in env files
//   // by using node crypto package we can generate random string
//   // require('crypto').randomBytes(64).toString('hex)

//   const { username } = req.body;
//   const user = {
//     name: username,
//   };

//   const accessToken = jwt.sign(user, process.env.SECRET_ACCESS_TOKEN);
//   res.json({
//     accessToken: accessToken,
//   });
// });

app.get("/posts", authenticateToken, (req, res) => {
  // Send only posts based on the users username

  res.json(POSTS.filter((post) => post.username === req.user.name));
});

// Create a Middleware to check if the token from client is valid or not

function authenticateToken(req, res, next) {
  // Get the access token first
  // Token is present on headers
  // From authorization headers will have token in the format like
  // BEARER UTR2IR23RT23DVBSNDCVSDJS (TOKEN)
  const authHeader = req.headers["authorization"];
  // Auth header contain data as BEARER TOKEN, so get the second element
  const token = authHeader && authHeader.split(" ")[1];

  // If token null, let the user know
  if (token == null) return res.status(401).send("No token present");

  // If theres any token, verify it
  jwt.verify(token, process.env.SECRET_ACCESS_TOKEN, (err, user) => {
    if (err) return res.sendStatus(403);
    // sending response from our middleware to a y router listening
    req.user = user;
    next();
  });
}

app.listen(3000, () => console.log(`APP IS UP & RUNNING`));
