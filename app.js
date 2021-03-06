const express = require("express");
const expressGraphQL = require("express-graphql");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const graphqlSchema = require("./graphql/schema/index");
const graphqlResolvers = require("./graphql/resolvers/index");
const externalRequest = require("./middleware/external-requests");
const isAuth = require("./middleware/is-auth");

const app = express();

app.use(bodyParser.json());

app.use(externalRequest);

app.use(isAuth);

app.use(
  "/graphql",
  expressGraphQL({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
    graphiql: true
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${
    process.env.MONGO_PASSWORD
    }@eventbooking-iquob.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`
  )
  .then(() => app.listen(8000))
  .catch(err => console.log(err));
