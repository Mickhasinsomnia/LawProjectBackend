import express from "express";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import cors from "cors";
import yaml from "yamljs";
import path from "path";
import { fileURLToPath } from "url";


import connectDB from "./config/db.js";
import appointment from "./routes/appointment.js";
import auth from "./routes/auth.js";
import caseRequest from "./routes/caseRequest.js";
import lawyer from "./routes/lawyer.js";
import forum from "./routes/forum.js";
import news from "./routes/news.js";
import article from "./routes/article.js";
import comment from "./routes/comment.js";
import otpService from "./routes/otpService.js";
import chat from "./routes/chat.js";
import report from "./routes/report.js";
import payment from "./routes/payment.js";
import admin from "./routes/admin.js";
import notification from "./routes/notification.js";
import review from "./routes/review.js";

dotenv.config({ path: "./config/config.env" });
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// OTP rate limit
const otpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 4,
  message: "Too many OTP requests, please try again in 1 minute.",
});


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerDocument = yaml.load(path.join(__dirname, "./swagger/swagger.yaml"));

app.get("/swagger.json", (req, res) => {
  res.json(swaggerDocument);
});


app.get("/api-docs", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Swagger Docs</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css">
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
        <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js"></script>
        <script>
          SwaggerUIBundle({
            url: '/swagger.json',
            dom_id: '#swagger-ui',
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            layout: "StandaloneLayout"
          });
        </script>
      </body>
    </html>
  `);
});

// Routes
app.use("/api/v1/appointment", appointment);
app.use("/api/v1/auth", auth);
app.use("/api/v1/caseRequest", caseRequest);
app.use("/api/v1/lawyer", lawyer);
app.use("/api/v1/forum", forum);
app.use("/api/v1/news", news);
app.use("/api/v1/article", article);
app.use("/api/v1/forum", comment);
app.use("/api/v1", report);
app.use("/api/v1/otpService", otpLimiter, otpService);
app.use("/api/v1/chat", chat);
app.use("/api/v1/payment", payment);
app.use("/api/v1/admin", admin);
app.use("/api/v1/notification", notification);
app.use("/api/v1/review", review);

export default app;
