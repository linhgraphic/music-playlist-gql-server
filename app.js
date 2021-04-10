const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const app = express();
const schema = require("./schema/schema");
const cors = require("cors");
const connectDb = require("./config/mongoDb");

const PORT = process.env.port || 3002;
app.use(cors());
// mongoose
//   .connect(Url, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then((result) => console.log("connect to mongodb"))
//   .catch((err) => console.log(err));
connectDb();
app.use(
  "/playlist",
  graphqlHTTP((req) => {
    return {
      schema,
      context: { req, test: "hello Linh" },
      graphiql: true,
    };
  })
);
app.listen(PORT, () => console.log("listen to port 3002"));
