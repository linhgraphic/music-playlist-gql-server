const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const songSchema = new Schema({
  title: { type: String, require: [true, "title is required"] },
  date: Number,
  artistId: String,
  userName: String,
  createdAt: String,
  // user: { type: Schema.Types.ObjectId, ref: users },
});

module.exports = mongoose.model("Song", songSchema);
