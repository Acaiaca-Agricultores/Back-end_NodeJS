// Imports
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configs
dotenv.config();
const app = express();
const allowedOrigin = process.env.CORS_ORIGIN;
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Models
import User from "./models/User.js";

// Middleware: Token checker
function checkToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ msg: "Acesso não autorizado. Por favor, faça login." });

    try {
        const secret = process.env.SECRET;
        const decoded = jwt.verify(token, secret);
        req.userId = decoded.id;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ msg: "Sua sessão expirou. Por favor, faça login novamente." });
        }
        return res.status(401).json({ msg: "Token inválido. Por favor, faça login novamente." });
    }
}

// Configuração do multer para salvar imagens na pasta uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// Crie a pasta uploads se não existir
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

// Routes
app.get("/", (_, res) => res.status(200).json({ msg: "Welcome to the API" }));

app.post("/auth/register", async (req, res) => {
    try {
        const { username, email, password, confirmpassword, role, propertyName, city, state, phoneNumber } = req.body;

        if (!username || !email || !password || !confirmpassword || !role || !city || !state) {
            return res.status(422).json({ msg: "Todos os campos obrigatórios devem ser preenchidos." });
        }
        if (password !== confirmpassword) {
            return res.status(422).json({ msg: "As senhas não conferem." });
        }
        if (!["agricultor", "consumidor"].includes(role)) {
            return res.status(422).json({ msg: "O tipo de usuário (agricultor ou consumidor) é obrigatório." });
        }
        if (role === "agricultor" && !propertyName) {
            return res.status(422).json({ msg: "O nome da propriedade é obrigatório para agricultores." });
        }
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(422).json({ msg: "Este email já está cadastrado." });

        const passwordHash = await bcrypt.hash(password, await bcrypt.genSalt(12));
        const user = new User({
            username,
            email,
            password: passwordHash,
            confirmpassword: passwordHash,
            role,
            propertyName,
            cityName: city,
            stateName: state,
            phoneNumber,
        });
        await user.save();
        res.status(201).json({
            msg: "Usuário criado com sucesso!",
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            phoneNumber: user.phoneNumber,
            propertyName: user.propertyName,
            cityName: user.cityName,
            stateName: user.stateName,
            imageProfile: user.imageProfile,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        });
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ msg: "Dados inválidos. Verifique os campos e tente novamente." });
        }
        if (err.code === 11000) {
            return res.status(409).json({ msg: "Email já cadastrado." });
        }
        console.error(err);
        res.status(500).json({ msg: "Erro interno ao criar o usuário. Tente novamente mais tarde." });
    }
});

app.post("/auth/login", async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role) {
            return res.status(422).json({ msg: "Todos os campos são obrigatórios." });
        }
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "Usuário não encontrado." });
        if (user.role !== role) return res.status(403).json({ msg: "Tipo de usuário inválido." });
        const checkPassword = await bcrypt.compare(password, user.password);
        if (!checkPassword) return res.status(422).json({ msg: "Senha inválida." });
        const token = jwt.sign({ id: user._id }, process.env.SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
            algorithm: "HS256",
        });
        res.status(200).json({
            msg: "Login realizado com sucesso!",
            token,
            username: user.username,
            role: user.role,
            userId: user._id,
            expiresIn: process.env.JWT_EXPIRES_IN,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro interno ao realizar login. Tente novamente mais tarde." });
    }
});

app.get("/user/:id", checkToken, async (req, res) => {
    const user = await User.findById(req.params.id, "-password");
    if (!user) return res.status(404).json({ msg: "Usuário não encontrado." });
    res.status(200).json({
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            propertyName: user.propertyName,
            cityName: user.cityName,
            stateName: user.stateName,
            phoneNumber: user.phoneNumber,
            imageProfile: user.imageProfile,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    });
});

app.delete("/user/:id", checkToken, async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "Usuário não encontrado." });

    if (user._id.toString() !== req.userId) {
        return res.status(403).json({ msg: "Acesso não autorizado." });
    }

    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ msg: "Usuário deletado com sucesso." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao deletar usuário." });
    }
});

// Editar todo o perfil do usuário, incluindo imagem
app.put("/user/:id/edit", checkToken, upload.single("profileImage"), async (req, res) => {
    const userId = req.params.id;
    if (userId !== req.userId) {
        return res.status(403).json({ msg: "Acesso não autorizado." });
    }
    try {
        const { username, email, propertyName, cityName, stateName } = req.body;
        let updateData = {
            username,
            email,
            propertyName,
            cityName,
            stateName,
            updatedAt: new Date()
        };
        if (req.file) {
            updateData.imageProfile = `/uploads/${req.file.filename}`;
        }
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
        const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
        if (!user) return res.status(404).json({ msg: "Usuário não encontrado." });
        res.status(200).json({ msg: "Perfil atualizado com sucesso!", user });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ msg: "Dados inválidos para atualização." });
        }
        console.error(error);
        res.status(500).json({ msg: "Erro ao atualizar perfil. Tente novamente mais tarde." });
    }
});

// DB Connection
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

mongoose
    .connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.dsfgq3p.mongodb.net/`)
    .then(async () => {
        console.log("Connected to MongoDB");

        try {
            const collection = mongoose.connection.db.collection("users");
            const indexes = await collection.indexes();
            const idIndex = indexes.find((i) => i.name === "id_1");
            if (idIndex) {
                await collection.dropIndex("id_1");
                console.log("Índice 'id_1' removido com sucesso.");
            }
        } catch (error) {
            console.error("Erro ao remover índice 'id_1':", error);
        }

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.error("Erro na conexão com o MongoDB:", err));
