var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const path = require('path');
var crypto = require("crypto");
var mongoose = require("mongoose");
var multer = require("multer");
var fs = require("fs");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
var Forum = require("./models/forum");

// MiddleWare
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/public"));

app.set("view engine", "ejs");

// Mongo Setup
// mongoose.connect("mongodb+srv://vegito123:vegito123@mcluster-kttiw.mongodb.net/yelpcamp?retryWrites=true&w=majority",{useNewUrlParser:true});
const mongoURI = "mongodb://127.0.0.1:27017/zero";

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
var filen;
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
var upload = multer({ storage:storage }).single('application[file]');

// ROUTES
app.get("/", function (req, res) {
  res.render("landing");
});

// INDEX
app.get("/my", function (req, res) {
  res.render("my");
});

// NEW
app.get("/apply", function (req, res) {
  res.render("apply");
});

app.get("/upload", function (req, res) {
  res.render("upload");
});

//CREATE

app.post('/my',function(req,res){
  upload(req,res,function(err) {
      if(err) {
          res.send(err);
      }
      console.log(filen);
      req.body.application.file=filen;
      Forum.create(req.body.application, function (err, camp) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/my");
        }
      });
  });

});
// app.post("/my", upload.single("file"), function (req, res) {

  // Forum.create(req.body.application, function (err, camp) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     res.redirect("/");
  //   }
  // });
// });


//SHOW
app.get("/status", function (req, res) {
  res.render("status");
});



//Extras
app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/contact", function (req, res) {
  res.render("contact");
});

app.get("/faq", function (req, res) {
  res.render("faq");
});

app.get("/help", function (req, res) {
  res.render("help");
});

//Wrong Route
app.get("*", function (req, res) {
  res.send("Trying to go somewhere else??");
});

// app.post("/my", function (req, res) {
//   Complaint.create(req.body.application, function (err, comp) {
//     if (err) {
//       console.log(err);
//     } else {
//       res.redirect("/my");
//     }
//   });
// });

const port = 3000;

app.listen(port, function () {
  console.log(`Server is listening on port ${port}`);
});
