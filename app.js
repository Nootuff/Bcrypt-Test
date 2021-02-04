/*
EmochNoh : Winter 
Adam : promare1
Phocus : Campaign1
These aren't important, just the login data saved to this demo program
*/

const bcrypt = require('bcryptjs');

const express = require('express');
const app = express();
const path = require("path");
app.set("views", path.join(__dirname, "/views"))

const mongoose = require('mongoose');

const ejs = require('ejs');

const session = require("express-session");

mongoose.connect('mongodb://localhost:27017/bcryptTest', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(function () {
        console.log("Mongo connection online")
    })
    .catch(function (error) {
        console.log("Mongo connection failure")
        console.log(error)
    })

const db = mongoose.connection; //No idea what this code does, seems to just put messages in console log
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database connected");
});

app.use(express.urlencoded({ extended: true })); //This allows you to use the data that the user enters into the form on the register ejs page. 

const User = require("./models/user"); //Imports the userSchema from user.js

const sessionConfig = {
    secret: "secretGoesHere",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7

    }
}
app.use(session(sessionConfig));

const requireLogin = (req, res, next) =>{ //This is a middleware function used for logging in
    if(!req.session.user_id){ //If it does not exist, that means you are not logged in & are redirected.
    return res.redirect("/login")
    }
    next(); //If you're not NOT logged in then the route this middleware is included in will do whatever its supposed to do next. In the case of the /secret route it renders the secret page. 
    }

app.get("/", function (req, res) {
    res.send("Homepage goes here");
});

app.get("/register", function (req, res) {
    res.render("register.ejs")
});

app.post("/logout", (req, res) => {
    req.session.user_id = null; //Removes any kind of id.
    res.redirect("/login");
})



app.get("/secret", requireLogin, function (req, res) {
    /*
    if (!req.session.user_id) {
      return res.redirect("/login") //The return statement is needed because return automatically ends a function? Prevents this and the res.render secret happenning at the same time? This if statement has been commented out, replaced by the requireLogin middleware, next in that middleware means go to the res.render below. 
    }
    */
    res.render("secret.ejs");
});

app.get("/login", function (req, res) {
    res.render("login.ejs")
})

app.post("/register", async (req, res) => {
    const pass = req.body.password; //Holds the password input from register ejs. 
    const user = req.body.username;
    const hash = await bcrypt.hash(pass, 12) //Runs data in pass through bcrypt's hash function. 
    const newUser = new User({
        username: user, //username in user schema set to const user.
        hashedPassword: hash //Value of hashedPassword from the user schema is set to const hash.
    }) //Creates a new user using the userSchema from user.ejs required in the User const above using the data passed from register form with password modifed by hash. 
    await newUser.save();
    req.session.user_id = newUser._id; //The session id is set to the _id value of the newly created user so you are automatically logged in when you register? user_id is used to store the _id, which is the ObjectId of your user.js document in mongo. This is to ensure persistent login at your site. On each request the app checks if requester has user_id in its session. So, req.session.user_id is the _id of successfully logged in user.
    res.redirect("/");
});

app.post("/login", async (req, res) => {
    const pass = req.body.password; //Holds password from login form 
    const user = req.body.username; //Holds username
    const foundUser = await User.findAndValidate(user, pass); //findAndValidate is the middleware from the user.js pag, imported with the rest of the model. 
    /*
    const userFind = await User.findOne({ username: user }) //Using findOne method, it finds an instance of something created with User schema where its username value matches data held in const user.
    const validPassword = await bcrypt.compare(pass, userFind.hashedPassword) //bcrypt method here. .compare compares data in pass to the hashedPassword value of the instance of User held in userFind to see if they match and are true. 
    */
    console.log(foundUser);
    if (foundUser) {
        req.session.user_id = foundUser._id; //If you do successfully login, your user id of your account from the database is stored in the session? 
        res.redirect("/secret");
    } else {
        res.redirect("/login");
    }
});

app.listen(3000, function () {
    console.log('Bycrypt test online now');
});