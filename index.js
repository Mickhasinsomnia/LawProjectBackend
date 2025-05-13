const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const schedule=require('./routes/schedule')

dotenv.config({ path: "./config/config.env" });
connectDB();


const PORT = process.env.PORT || 5050;

const app = express();
const server = app.listen(
  PORT,
  console.log("Server running in", process.env.NODE_ENV, " mode on port", PORT),
);

app.use(express.json());

app.use('/api/v1/schedule', schedule);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);

  server.close(() => process.exit(1));
});
