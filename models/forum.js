var mongoose = require("mongoose");

var forumSchema = new mongoose.Schema({
  email: String,
  mobile: Number,
  aadhar: Number,
  address: String,
  district: String,
  state: String,
  pin: Number,
  type: String,
  date: { type: Date, default: Date.now() },
  curr_date: { type: Date, default: Date.now() },
  details: String,
  suspect: String,
  witness: String,
  file: String,
  fileno: String,
  success: Boolean,
  name: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    user: String,
  },
});

module.exports = mongoose.model("Forum", forumSchema);
