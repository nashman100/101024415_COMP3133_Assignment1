const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const { graphqlUploadExpress } = require("graphql-upload");

dotenv.config();

const schema = require('./schema/schema');
const resolver = require('./resolvers/resolver');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Success: MongoDB Connected');
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));
app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 1 }));

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs: schema,
    resolvers: resolver,
    context: ({ req }) => {
      req.body = req.body || {};
      return { req };
    }
  });

  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
};

connectDB().then(startServer);
