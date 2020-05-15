var express = require("express");
var app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/public"));

app.set("view engine", "ejs");

app.get("/", function (req, res) {
  res.render("landing");
});


//INDEX
app.get("/my", function (req, res) {
  res.render("my");
});

//NEW
app.get("/apply", function (req, res) {
  res.render("apply");
});

app.get("/upload", function (req, res) {
  res.render("upload");
});

//CREATE


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

app.listen(3000, function () {
  console.log("Server is listening on port 3000");
});
