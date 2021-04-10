const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const artistSchema = new Schema({
  name: { type: String, require: [true, "name is required"] },
  bio: { type: String },
});

module.exports = mongoose.model("Artist", artistSchema);
