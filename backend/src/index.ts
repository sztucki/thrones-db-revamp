import "express-async-errors";
import express from "express";
import cookieParser from "cookie-parser";
import { config } from "./config.js";
import { corsMiddleware } from "./middleware/cors.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { healthRouter } from "./routes/health.js";
import { cardsRouter } from "./routes/cards.js";
import { factionsRouter } from "./routes/factions.js";

const app = express();

app.use(corsMiddleware);
app.use(express.json());
app.use(cookieParser());

app.use("/api", healthRouter);
app.use("/api", cardsRouter);
app.use("/api", factionsRouter);

app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`Backend listening on http://localhost:${config.PORT}`);
});
