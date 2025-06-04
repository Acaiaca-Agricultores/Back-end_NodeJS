import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./scr/routes/userRoutes.js";

dotenv.config();

const app = express();
const allowedOrigin = process.env.CORS_ORIGIN;
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || origin === allowedOrigin || origin === allowedOrigin + "/") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/", (_, res) => res.status(200).json({ msg: "Welcome to the API" }));

app.use("/", userRoutes);

export default app;
