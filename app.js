const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const app = express();
const schema = require("./schema/schema");
const cors = require("cors");
const connectDb = require("./config/mongoDb");

const PORT = process.env.port || 3002;
app.use(cors());

connectDb();
app.use(
  "/",
  graphqlHTTP((req) => {
    return {
      schema,
      context: { req },
      graphiql: true,
    };
  })
);
app.listen(PORT, () => console.log("listen to port 3002"));
