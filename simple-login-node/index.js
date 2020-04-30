const express = require("express");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json()); // Tell our application to accept json

// Store all our users in a varibale in a production app
// it should happen in DATABASE
const users = [];

// Rest APIs here

// Provide the list of users
app.get("/users", (req, res) => {
  res.send(users);
});

// here for this route, we are not hashing our password and saving our password
// directly,
// if we just hash our password it will genearte random hash for our password
// Lets say if users contain same password and if atatcker tries to steal
// info he will get access to all the same passwords

// hash(password1) => this generates something like //#aabbcc
// hash(password2) => //#aabbcc
// If any attackers tries to unhash password, he will get access to all the
// same passwords

app.post("/unsafeuser", (req, res) => {
  const { name, password } = req.body;
  console.log(req.body);
  const user = { name, password };

  users.push(user);
  res.send("user successfully created");
});

// Using bcrypt lets save our passwords safely
// the concpet of bcrypt is we can salt our password
// and hash and save it
// so each password is unique and doesnt have same hash

// step:1
// add salt to password => salt + password1 => "jgqfjjfg"
// Step: 2
// hash the salted password => hash(salt+password) => generates #aaccdd
// If we consider both password1 & password2 are same then
// hash (salt + password1) => #aacctt
// hash (salt + password2) => #bbttee
// So even if attacks happens the hash for every password is different

// Bcrypt is async operation so lets put async before our fn
app.post("/safeuser", async (req, res) => {
  try {
    // Generate Salt
    // By default genSalt takes 10 as default
    // If we provide 20 or 30 to genSalt it will take 2 or 3 days
    // to generate salt

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // the above two lines can also be written as
    // Just pass 10 as second argument
    // const hashedSaltedPassword = await bcrypt.hash(req.body.password, 10);

    console.log(salt);
    console.log(hashedPassword);

    // This will generate password as
    // $2b$10$rZPO.wUVHLMk586IQKEzfO59NIFUCXzCEe8LrGqkGmeOcwn3AhlxW"
    // $2b$10$rZPO is salt follwed by password

    const user = { name: req.body.name, password: hashedPassword };
    users.push(user);
    res.status(201).send("user safely created. Success");
  } catch {
    res.status(500).send();
  }
});

// Now compare our password with Bcrypt

app.post("/user/login", async (req, res) => {
  // Find the user by name
  const user = users.find((user) => user.name === req.body.name);
  if (user === null) {
    res.status(400).send("Sorry, Cant find the user");
  }
  try {
    // Comapring password is done by bcrypt.compare, whic returns boolean
    if (await bcrypt.compare(req.body.password, user.password)) {
      res.status(200).send("Success");
    } else {
      res.status(200).send("Not allowed, Sorry");
    }
  } catch (error) {
    res.status(500).send();
  }
});

app.listen("3000", () => console.log("App is up & running"));
