import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Routes from "./scr/routes/Routes.js";

dotenv.config();

const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowedOrigin = process.env.CORS_ORIGIN;

    const normalizedAllowedOrigin = allowedOrigin.replace(/\/$/, '');
    const normalizedOrigin = origin.replace(/\/$/, '');

    if (normalizedOrigin === normalizedAllowedOrigin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/", (_, res) => res.status(200).json({ msg: "Welcome to the API" }));

app.use("/", Routes);

export default app;
