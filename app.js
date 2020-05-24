var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const path = require("path");
var crypto = require("crypto");
var mongoose = require("mongoose");
var passport = require("passport");
var localStrategy = require("passport-local");
var multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
var Forum = require("./models/forum");
var User = require("./models/user");
var flash = require("connect-flash");

// Switch
var prev = false;

// MiddleWare
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  require("express-session")({
    secret: "hasher",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());

app.use(express.static(__dirname + "/public"));

app.set("view engine", "ejs");

app.use(function (req, res, next) {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentuser = req.user;
  next();
});

// Mongo Setup
const mongoURI =
  "mongodb+srv://testuser:testuser@mcluster-kttiw.mongodb.net/test?retryWrites=true&w=majority";

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
const conn = mongoose.connection;

let gfs;

conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
  console.log("Database connected:");
});

conn.on("error", (err) => {
  console.error("Connection Error:", err);
});

// Storage Engine
var filen, objid;
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        filen = filename;
        resolve(fileInfo);
      });
    });
  },
});
var upload = multer({ storage: storage }).single("application[file]");

// ROUTES

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/loginregister");
}

app.get("/", isLoggedIn, function (req, res) {
  res.render("landing");
});

// INDEX
app.get("/my", isLoggedIn, function (req, res) {
  Forum.find({}, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      res.render("my", { datas: data });
    }
  });
});

app.get("/otp", isLoggedIn, function (req, res) {
  res.render("otp");
});

// NEW
app.get("/apply", isLoggedIn, function (req, res) {
  res.render("apply");
});

app.get("/upload", isLoggedIn, function (req, res) {
  res.render("upload");
});

//CREATE
var appno;
app.post("/my", function (req, res) {
  upload(req, res, function (err) {
    if (err) {
      res.send(err);
    }
    appno = Math.floor(100000 + Math.random() * 900000);
    req.body.application.file = filen;
    req.body.application.fileno = appno;
    req.body.application.success = prev;
    var helper = {
      ...req.body.application,
      name: {
        id: req.user._id,
        user: req.body.application.name,
      },
    };
    Forum.create(helper, function (err, data) {
      if (err) {
        console.log(err);
      } else {
        objid = data._id;
        res.redirect("/otp");
      }
    });
  });
});

app.post("/otp", function (req, res) {
  var pass = req.body.pass;
  if (pass === "12345678") {
    prev = !prev;
    res.render("success", { appno: appno });
  } else {
    var myquery = { _id: objid };
    conn.collection("forums").deleteOne(myquery, function (err, obj) {
      if (err) {
        console.log(err);
      }
    });
    res.render("fail");
  }
});

app.post("/search", function (req, res) {
  var from = req.body.date.from;
  var to = req.body.date.to;
  Forum.find({}, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      res.render("showfir", { datas: data, from: from, to: to });
    }
  });
});

//SHOW
app.get("/search", isLoggedIn, function (req, res) {
  res.render("search");
});

app.get("/view/:id", isLoggedIn, function (req, res) {
  //console.log(req.params.id);
  Forum.findById(req.params.id, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      // console.log(data);
      // picview = data.file;

      res.render("view", { data: data });
    }
  });
});

app.get("/image/:filename", isLoggedIn, (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      console.log("d");
    }
    // Check if image
    if (file.contentType === "image/jpeg" || file.contentType === "image/png") {
      // Read output to browser

      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: "Not an image",
      });
    }
  });
});

app.get("/cancel", isLoggedIn, function (req, res) {
  res.render("cancel");
});

//LogIn & REGISTER
app.get("/loginregister", function (req, res) {
  res.render("loginregister");
});

//handle SIGN UP
app.post("/register", function (req, res) {
  User.register(
    new User({ username: req.body.username, uniqueid: req.body.uniqueid }),
    req.body.password,
    function (err, user) {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("/loginregister");
      } else {
        passport.authenticate("local")(req, res, function () {
          req.flash("success", "sd");
          res.redirect("/");
        });
      }
    }
  );
});

//SIGN IN
// app.get("/login", function (reqq, res) {
//   res.render("login");
// });

//SIGN IN POST
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/loginregister",
    successFlash: "Successfully Logged in",
    failureFlash: "Incorrect username or password",
  }),
  function (req, res) {
    res.cookie("name", "oof");
  }
);

//LOGOUT
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/loginregister");
});

//Wrong Route
app.get("*", function (req, res) {
  res.send("Trying to go somewhere else??");
});

const port = 3000;

app.listen(port, function () {
  console.log(`Server is listening on port ${port}`);
});
