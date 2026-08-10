import express from "express";
import cookieParser from "cookie-parser";
import { config } from "./config.js";
import { corsMiddleware } from "./middleware/cors.js";
import { healthRouter } from "./routes/health.js";

const app = express();

app.use(corsMiddleware);
app.use(express.json());
app.use(cookieParser());

app.use("/api", healthRouter);

app.listen(config.PORT, () => {
  console.log(`Backend listening on http://localhost:${config.PORT}`);
});
