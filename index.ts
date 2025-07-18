import express from "express";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import cors from "cors";
import connectDB from "./config/db.js";
import appointment from "./routes/appointment.js";
import auth from "./routes/auth.js";
import caseRequest from "./routes/caseRequest.js";
import workingDay from "./routes/workingDay.js";
import lawyer from "./routes/lawyer.js";
import forum from "./routes/forum.js";
import news from "./routes/news.js";
import article from "./routes/article.js";
import comment from "./routes/comment.js";
import otpService from "./routes/otpService.js";
import chat from "./routes/chat.js";
import report from "./routes/report.js";
import payment from "./routes/payment.js";
import admin from "./routes/admin.js"
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';


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
app.use('/api/v1/workingDay', workingDay);
app.use('/api/v1/lawyer', lawyer);
app.use('/api/v1/forum', forum);
app.use('/api/v1/news', news);
app.use('/api/v1/article', article)
app.use('/api/v1/forum', comment);
app.use('/api/v1',report)
app.use('/api/v1/otpService', otpLimiter,otpService);
app.use('/api/v1/chat', chat);
app.use('/api/v1/payment',payment)
app.use('/api/v1/admin',admin)

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Law API',
      version: '1.0.0',
      description: 'API documentation for the Law project'
    },
    servers: [
      {
        url: '/'
      }
    ],
  },
  apis: ['./swagger/swagger.yaml'],
};
const swaggerDocs=swaggerJsDoc(swaggerOptions);
app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(swaggerDocs));

export default app;
