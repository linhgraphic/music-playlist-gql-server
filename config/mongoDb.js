const mongoose = require("mongoose");
const { Url } = require("./index");

const connectDb = async () => {
  try {
    await mongoose.connect(Url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    console.log("connect to mongodb");
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};

module.exports = connectDb;
