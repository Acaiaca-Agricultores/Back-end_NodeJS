import express from "express";
import cors from "cors";
import 'dotenv/config';
import connectDB, { sequelize } from "./scr/config/database.js";
import Routes from "./scr/routes/Routes.js";
import "./scr/models/associations.js";

const app = express();

(async () => {
    try {
        await connectDB();
        await sequelize.sync();
        console.log('Connected to PostgreSQL and synchronized.');
        const allowedOrigin = process.env.CORS_ORIGIN;
        app.use(cors({ origin: allowedOrigin, credentials: true }));
        app.use(express.json());
        app.use('/uploads', express.static('uploads'));
        app.use('/', Routes);

        const PORT = process.env.PORT;
        app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
    } catch (error) {
        console.error('Failed to start server:', error);
    }
})();