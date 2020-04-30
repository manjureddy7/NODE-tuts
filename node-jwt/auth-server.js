require("dotenv").config();

const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

app.use(express.json());

// Generally we will make our jwt to exipre in some time
// In that case user can make request with refresh token
// and he can generate token

// Save all our refresh tokens here
let refreshTokens = [];

// Generate new accessToken JWT using refreshToken
app.post("/token", (req, res) => {
  // Get refresh token from the body
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    // Generate new access token
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken: accessToken });
  });
});

app.delete("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

// On successful login generate both accessToken which expires in sometime
// and one refresh token which can be expired only by manual deletion

app.post("/login", (req, res) => {
  // Authenticate User
  // Creating JWT is very simple
  // we need to call jwt.sign() and pass payload and secret
  // we will store our secret in env files
  // by using node crypto package we can generate random string
  // require('crypto').randomBytes(64).toString('hex)

  const username = req.body.username;
  const user = { name: username };

  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
  refreshTokens.push(refreshToken);
  res.json({ accessToken: accessToken, refreshToken: refreshToken });
});

// Generate accessToken based on user obj
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" });
}

app.listen(4000);
