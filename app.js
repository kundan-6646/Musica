//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const fileupload = require("express-fileupload");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
const { PythonShell } = require("python-shell");
const nodemailer = require('nodemailer');


const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.use(fileupload());

app.use(session({
    secret: 'Our little secret.',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


//Nodemailer setup
var transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAIL_TRAP_ID,
    pass: process.env.MAIL_TRAP_PASS
  }
});



//setting mongoDB
mongoose.connect("mongodb://localhost:27017/musicaDB", {useNewUrlParser: true});

const fileSchema = new mongoose.Schema({
  name: String,
  split: String,
  sessionId: String
});

const UserFile = new mongoose.model("UserFile", fileSchema);


const userSchema = new mongoose.Schema({
    email: String,
    googleId: String,
    name: String,
    picture: String,
    files: [fileSchema]
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

// used to serialize the user for the session
passport.serializeUser(function(user, done) {
    done(null, user.id); 
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

//google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/dashboard"
  },
  //https://musica-niet.herokuapp.com/auth/google/dashboard
  function(accessToken, refreshToken, profile, cb) {

    User.findOrCreate({ googleId: profile.id, name: profile._json.name, picture: profile._json.picture }, function (err, user) {
      return cb(err, user);
    });
  }
));


app.get("/", function(req, res) {
    res.render("login");
});

app.get('/auth/google/dashboard', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect secrets page.
    res.redirect('/dashboard');
  });

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get("/", function(req, res) {
    res.render("login");
});

app.get("/dashboard", function(req, res) {
    if(req.isAuthenticated()) {
      res.render("dashboard",  {userName: req.user.name, userImage: req.user.picture});
    }else{
        res.redirect("/");
    }
    
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.get("/contact", function(req, res) {
  res.render("contact");
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect('/');
});

app.get("/dashboard/:sessionID", function(req, res) {

  if(req.isAuthenticated()) {
    let currentRequestedSession = req.params.sessionID;

    User.findOne({"_id": req.user._id},{files: {$elemMatch: {sessionId: currentRequestedSession}}}, function(err, foundFile){
      if (!err){
          const currentFile = foundFile.files[0];
          res.render("player", {userId: req.user._id, userName: req.user.name, userFile: currentFile, userImage: req.user.picture});
      }else {
          console.log(err);
      }
    });
  }else{
      res.redirect("/");
  }
  
});






app.post("/processAudio", function(req, res) {
  let file = req.files.file;
  let splitCount = req.body.splitCount;
  let newSessionId = uuidv4();
  let fileName = file.name;
  let stemsCount = req.body.splitCount;

  if (fs.existsSync(__dirname + "/public/uploads/" + req.user._id)) {
    console.log("Directory exists.");
  } else {
    //Directory does not exist
    fs.mkdirSync( __dirname + "/public/uploads/" + req.user._id);
  }

  //new session folder
  fs.mkdirSync( __dirname + "/public/uploads/" + req.user._id + "/" + newSessionId);
  
  //upload and output folder
  fs.mkdirSync( __dirname + "/public/uploads/" + req.user._id + "/" + newSessionId + "/upload");
  fs.mkdirSync( __dirname + "/public//uploads/" + req.user._id + "/" + newSessionId + "/output");

  //new file
  const newFile = new UserFile({
      name: fileName,
      split: stemsCount,
      sessionId: newSessionId
  });
  
  let filePath = __dirname + "/public/uploads/" + req.user._id + "/" + newSessionId + "/upload/" + fileName;
  file.mv(filePath, function(err) {
    if(err) {
      res.send(err)
      return;
    }else {

      let dataBuffer = fs.readFileSync(filePath);
      User.findOneAndUpdate({_id: req.user._id}, {$push: {files: newFile}}, function(err, foundUser){
        if (!err){
          console.log("newSessionId pushed");
        }
      });

    }
  });

  const fileToSplitPath = __dirname + "/public/uploads/" + req.user._id + "/" + newSessionId + "/upload/" + fileName;
  const outputFilePath =  __dirname + "/public/uploads/" + req.user._id + "/" + newSessionId + "/output";
  // Make sure Spleeter is installed
  PythonShell.run(
    "./python_scripts/install_package.py",
    { args: ["spleeter"] },
    (err) => {
      if (err) {
        throw err;
      } else {
        console.log("Splitting audio file.");
        // Get audio file
        const spleeterOptions = {
          args: [stemsCount, outputFilePath, fileToSplitPath],
        };

        // Split audio into stems and clean up
        PythonShell.run(
          "./python_scripts/spleeter_stems.py",
          spleeterOptions,
          (err) => {
            if (err) {
              throw err;
            } else {
              console.log("Successfully split track into " + stemsCount + "stems");
              fs.unlinkSync(fileToSplitPath);
              //Removed pretrained_models directory and local audio file
              fs.rmSync("pretrained_models", { recursive: true });

              res.redirect("/dashboard/" + newSessionId);
            }
          }
        );
      }
    }
  );
  
});


app.post("/contact", function(req, res) {
  const senderName = req.body.userName;
  const senderEmail = req.body.userEmail;
  const msg = req.body.msg;

  const mailOptions = {
    from: senderEmail,
    to: 'candyboy6646@gmail.com',
    subject: 'Musica User Message',
    text: msg,
    html: `<h5>${senderName}</h5>`
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      res.render("thanks");
    }
  });
});


let port = process.env.PORT;
if(port == null || port == "") {
    port = 3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});