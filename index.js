import express from "express";
import cors from "cors";
import 'dotenv/config';
import connectDB from "./scr/config/database.js";
import userRoutes from "./scr/routes/userRoutes.js";

const app = express();

connectDB();
const allowedOrigin = process.env.CORS_ORIGIN;
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use(userRoutes);

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});