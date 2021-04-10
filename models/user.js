const { model, Schema } = require("mongoose");

const userSchema = new Schema({
  username: String,
  password: String,
  token: String,
  // songs: [{ type: Schema.Types.ObjectId, ref: "Song" }],
});

module.exports = model("User", userSchema);
