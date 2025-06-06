const express = require("express");
const dotenv = require("dotenv");
const rateLimit = require('express-rate-limit');
const connectDB = require("./config/db");
const appointment= require('./routes/appointment')
const auth = require('./routes/auth')
const caseRequest = require('./routes/caseRequest')
const hiring = require ('./routes/hiring')
const workingDay = require ('./routes/workingDay')
const lawyer = require('./routes/lawyer')
const forum = require('./routes/forum')
const news = require ('./routes/news')
const otpService = require('./routes/otpService')


dotenv.config({ path: "./config/config.env" });
connectDB();

const PORT = process.env.PORT || 5050;

const app = express();
const server = app.listen(
  PORT,
  console.log("Server running in", process.env.NODE_ENV, " mode on port", PORT),
);

app.use(express.json());
const cors = require('cors');
app.use(cors());

const otpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 4,
  message: "Too many OTP requests, please try again in 1 minute."
});


app.use('/api/v1/appointment', appointment);
app.use('/api/v1/auth', auth);
app.use('/api/v1/caseRequest', caseRequest);
app.use('/api/v1/hiring', hiring);
app.use('/api/v1/workingDay', workingDay);
app.use('/api/v1/lawyer', lawyer);
app.use('/api/v1/forum', forum);
app.use('/api/v1/news', news);
app.use('/api/v1/otpService', otpLimiter,otpService);



process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);

  server.close(() => process.exit(1));
});
