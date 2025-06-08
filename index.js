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

app.get('/', (_req, res) => {
    return res.status(200).json({
        msg: 'API de gerenciamento de usuários: permite registro, login, visualização, edição, exclusão de perfis e alteração de senha.'
    });
});
app.use('/', userRoutes);

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});