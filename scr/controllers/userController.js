import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Product from "../models/Product.js";

export async function register(req, res) {
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
        const token = jwt.sign({ id: user._id }, process.env.SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
            algorithm: "HS256",
        });
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
            updatedAt: user.updatedAt,
            token,
            expiresIn: process.env.JWT_EXPIRES_IN
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
}

export async function login(req, res) {
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
}

export async function getUser(req, res) {
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
            Products: user.Products,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    });
}

export async function deleteUser(req, res) {
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
}

export async function editUser(req, res) {
    const userId = req.params.id;
    if (userId !== req.userId) {
        return res.status(403).json({ msg: "Acesso não autorizado." });
    }
    try {
        const { username, email, propertyName, cityName, stateName, phoneNumber, phone } = req.body;
        const newPhoneNumber = phoneNumber ?? phone;
        let updateData = {
            username,
            email,
            propertyName,
            cityName,
            stateName,
            updatedAt: new Date()
        };
        if (newPhoneNumber !== undefined) {
            updateData.phoneNumber = newPhoneNumber;
        }
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
}

export async function changePassword(req, res) {
    const userId = req.params.id;
    if (userId !== req.userId) {
        return res.status(403).json({ msg: "Acesso não autorizado." });
    }
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(422).json({ msg: "Todos os campos são obrigatórios." });
        }
        if (newPassword !== confirmPassword) {
            return res.status(422).json({ msg: "As novas senhas não conferem." });
        }
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: "Usuário não encontrado." });
        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) {
            return res.status(400).json({ msg: "Senha antiga incorreta." });
        }
        const hashed = await bcrypt.hash(newPassword, await bcrypt.genSalt(12));
        user.password = hashed;
        user.updatedAt = new Date();
        await user.save();
        res.status(200).json({ msg: "Senha atualizada com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao atualizar senha. Tente novamente mais tarde." });
    }
}

export async function getUserByEmail(req, res) {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(422).json({ msg: "Email é obrigatório." });
        }
        const user = await User.findOne({ email }, '-password');
        if (!user) {
            return res.status(404).json({ msg: "Usuário não encontrado." });
        }
        res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao buscar usuário por email." });
    }
}

export async function resetPassword(req, res) {
    try {
        const userId = req.params.id;
        const { newPassword, confirmPassword } = req.body;
        if (!userId || !newPassword || !confirmPassword) {
            return res.status(422).json({ msg: "Senhas são obrigatórios." });
        }
        if (newPassword !== confirmPassword) {
            return res.status(422).json({ msg: "As senhas não conferem." });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "Usuário não encontrado." });
        }
        const hashed = await bcrypt.hash(newPassword, await bcrypt.genSalt(12));
        user.password = hashed;
        user.updatedAt = new Date();
        await user.save();
        res.status(200).json({ msg: "Senha redefinida com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao redefinir senha. Tente novamente mais tarde." });
    }
}

export async function getAgricultores(req, res) {
    try {
        const agricultores = await User.find({ role: "agricultor" }, "-password");
        if (agricultores.length === 0) {
            return res.status(404).json({ msg: "Nenhum agricultor encontrado." });
        }
        const agricultoresWithProducts = await Promise.all(
            agricultores.map(async (user) => {
                const products = await Product.find({ userId: user._id });
                return { ...user.toObject(), products };
            })
        );
        res.status(200).json(agricultoresWithProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao buscar agricultores. Tente novamente mais tarde." });
    }
}