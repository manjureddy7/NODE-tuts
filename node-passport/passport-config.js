// Passport provides lot of stratigies like facebook,google,github etc
// here we are using passport local strategy

const LocalStrategy = require("passport-local").Strategy;

const bcrypt = require("bcrypt");

function initialize(passport, getUserByEmail, getUserById) {
  // tell passport to use the local strategy
  // need to provide Localstrategy couple of things
  // pass username & password fields
  // In our case particularly we dont have any username so
  // our usernamefield would be email
  // second parameter of passport use is authenticate function
  // Which will authencticate user

  const authenticateUser = async (email, password, done) => {
    // Authenticate user on login
    // get the user
    const user = getUserByEmail(email);
    console.log("user info nis", user);
    if (user == null) {
      // User doesnt exist
      // parameters of done are error,user,message
      // here no error, no user and a custom message
      return done(null, false, { message: "No user with that Email" });
    }

    try {
      if (await bcrypt.compare(password, user.hashedPassword)) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Passowrd incorrect" });
      }
    } catch (e) {
      return done(e);
    }
  };
  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));

  // passport.serializeUser() is setting id as cookie in user’s browser
  // and passport.deserializeUser() is getting id from the cookie, which
  //  is then used in callback to get user info or something else,
  //  based on that id or some other piece of information from the cookie
  // Serialize user ie store user in session
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id));
  });
}

module.exports = initialize;
