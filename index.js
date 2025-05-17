const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const appointment= require('./routes/appointment')
const auth = require('./routes/auth')
const caseRequest = require('./routes/caseRequest')
const clientCase = require ('./routes/clientCase')
const hiring = require ('./routes/hiring')


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
app.use('/api/v1/caseRequest', caseRequest);
app.use('/api/v1/clientCase', clientCase);
app.use('/api/v1/hiring', hiring);


process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);

  server.close(() => process.exit(1));
});
