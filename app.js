var express = require("express");
var app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/public"));

app.set("view engine", "ejs");

app.get("/", function (req, res) {
  res.render("landing");
});

app.get("/apply", function (req, res) {
  res.render("apply");
});

app.listen(3000, function () {
  console.log("Server is listening on port 3000");
});
