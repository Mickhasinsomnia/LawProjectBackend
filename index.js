const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const appointment= require('./routes/appointment')
const auth = require('./routes/auth')


dotenv.config({ path: "./config/config.env" });
connectDB();

const PORT = process.env.PORT || 5050;

const app = express();
const server = app.listen(
  PORT,
  console.log("Server running in", process.env.NODE_ENV, " mode on port", PORT),
);

app.use(express.json());

app.use('/api/v1/appointment', appointment);
app.use('/api/v1/auth', auth);


process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);

  server.close(() => process.exit(1));
});
