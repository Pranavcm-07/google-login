import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import path from "path";
import dotenv from "dotenv";
import session from "express-session";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(
  session({
    secret: "this is my secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/success",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    function (accessToken, refreshToken, profile, callback) {
      callback(null, profile);
      //   console.log(profile);
      console.log("accesstoken: ", accessToken);
      console.log("refreshtoken: ", refreshToken);
    }
  )
);

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "login.html"));
});
app.get("/success", function (req, res) {
  if (!req.isAuthenticated()) {
    res.redirect("/");
  }
  res.sendFile(path.join(__dirname, "success.html"));
});
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/success",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/success");
  }
);

app.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.listen(3000, function (req, res) {
  console.log("server is running on port 3000");
});
