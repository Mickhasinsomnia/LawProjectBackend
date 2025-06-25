const express = require("express");
const dotenv = require("dotenv");
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const connectDB = require("./config/db");
const appointment= require('./routes/appointment')
const auth = require('./routes/auth')
const caseRequest = require('./routes/caseRequest')
const hiring = require ('./routes/hiring')
const workingDay = require ('./routes/workingDay')
const lawyer = require('./routes/lawyer')
const forum = require('./routes/forum')
const news = require ('./routes/news')
const comment = require ('./routes/comment')
const otpService = require('./routes/otpService')
const chat = require('./routes/chat')
const report = require('./routes/report')

dotenv.config({ path: "./config/config.env" });
connectDB();


const app = express();

app.use(express.json());

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
app.use('/api/v1/forum', comment);
app.use('/api/v1',report)
app.use('/api/v1/otpService', otpLimiter,otpService);
app.use('/api/v1/chat', chat);

module.exports = app;
