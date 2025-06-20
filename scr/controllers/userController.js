import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { validate as isUuid } from 'uuid';

export async function register(req, res) {
    try {
        const { username, email, password, confirmpassword, role, propertyName, city, state, phoneNumber, historia } = req.body;

        // Validações de campos obrigatórios
        if (!username || !email || !password || !confirmpassword || !role || !city || !state) {
            return res.status(400).json({
                success: false,
                msg: "Todos os campos obrigatórios devem ser preenchidos.",
                requiredFields: ['username', 'email', 'password', 'confirmpassword', 'role', 'city', 'state']
            });
        }

        // Validação de comprimento do username
        if (username.length < 3) {
            return res.status(400).json({
                success: false,
                msg: "Nome de usuário deve ter pelo menos 3 caracteres.",
                field: 'username',
                minLength: 3,
                currentLength: username.length
            });
        }

        // Validação de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                msg: "Formato de email inválido.",
                field: 'email',
                receivedValue: email
            });
        }

        // Validação de senha
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                msg: "Senha deve ter pelo menos 6 caracteres.",
                field: 'password',
                minLength: 6,
                currentLength: password.length
            });
        }

        // Validação de confirmação de senha
        if (password !== confirmpassword) {
            return res.status(400).json({
                success: false,
                msg: "As senhas não conferem.",
                field: 'confirmpassword'
            });
        }

        // Validação de role
        if (!["agricultor", "consumidor"].includes(role)) {
            return res.status(400).json({
                success: false,
                msg: "O tipo de usuário deve ser 'agricultor' ou 'consumidor'.",
                field: 'role',
                validRoles: ['agricultor', 'consumidor'],
                receivedValue: role
            });
        }

        // Validação específica para agricultores
        if (role === "agricultor" && !propertyName) {
            return res.status(400).json({
                success: false,
                msg: "O nome da propriedade é obrigatório para agricultores.",
                field: 'propertyName',
                requiredForRole: 'agricultor'
            });
        }

        // Verificação de email já existente
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(409).json({
                success: false,
                msg: "Este email já está cadastrado.",
                field: 'email',
                error: 'EMAIL_ALREADY_EXISTS'
            });
        }

        const passwordHash = await bcrypt.hash(password, await bcrypt.genSalt(12));
        const user = await User.create({
            username,
            email,
            password: passwordHash,
            role,
            propertyName,
            cityName: city,
            stateName: state,
            phoneNumber,
            historia,
        });

        const token = jwt.sign({ id: user.id }, process.env.SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
            algorithm: "HS256",
        });

        res.status(201).json({
            success: true,
            msg: "Usuário criado com sucesso!",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
                propertyName: user.propertyName,
                cityName: user.cityName,
                stateName: user.stateName,
                historia: user.historia,
                imageProfile: user.imageProfile,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            token,
            expiresIn: process.env.JWT_EXPIRES_IN
        });
    } catch (err) {
        console.error('Erro ao registrar usuário:', err);

        if (err.name === "SequelizeValidationError") {
            return res.status(400).json({
                success: false,
                msg: "Dados inválidos. Verifique os campos e tente novamente.",
                errors: err.errors.map(error => ({
                    field: error.path,
                    message: error.message
                }))
            });
        }

        if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({
                success: false,
                msg: "Email já cadastrado.",
                field: 'email',
                error: 'EMAIL_ALREADY_EXISTS'
            });
        }

        res.status(500).json({
            success: false,
            msg: "Erro interno do servidor ao criar usuário. Tente novamente mais tarde.",
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
}

export async function login(req, res) {
    try {
        const { email, password, role } = req.body;

        // Validação de campos obrigatórios
        if (!email || !password || !role) {
            return res.status(400).json({
                success: false,
                msg: "Todos os campos são obrigatórios.",
                requiredFields: ['email', 'password', 'role']
            });
        }

        // Validação de formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                msg: "Formato de email inválido.",
                field: 'email',
                receivedValue: email
            });
        }

        // Validação de role
        if (!["agricultor", "consumidor"].includes(role)) {
            return res.status(400).json({
                success: false,
                msg: "Tipo de usuário inválido.",
                field: 'role',
                validRoles: ['agricultor', 'consumidor'],
                receivedValue: role
            });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "Usuário não encontrado.",
                field: 'email',
                error: 'USER_NOT_FOUND'
            });
        }

        if (user.role !== role) {
            return res.status(403).json({
                success: false,
                msg: "Tipo de usuário inválido para este email.",
                field: 'role',
                expectedRole: user.role,
                receivedRole: role,
                error: 'INVALID_ROLE'
            });
        }

        const checkPassword = await bcrypt.compare(password, user.password);

        if (!checkPassword) {
            return res.status(401).json({
                success: false,
                msg: "Senha inválida.",
                field: 'password',
                error: 'INVALID_PASSWORD'
            });
        }

        const token = jwt.sign({ id: user.id }, process.env.SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
            algorithm: "HS256",
        });

        res.status(200).json({
            success: true,
            msg: "Login realizado com sucesso!",
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                historia: user.historia
            },
            token,
            expiresIn: process.env.JWT_EXPIRES_IN,
        });
    } catch (error) {
        console.error('Erro ao realizar login:', error);
        res.status(500).json({
            success: false,
            msg: "Erro interno do servidor ao realizar login. Tente novamente mais tarde.",
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
}

export async function getUser(req, res) {
    const userId = req.params.id;

    if (!userId) {
        return res.status(400).json({
            success: false,
            msg: "ID do usuário é obrigatório.",
            field: 'userId'
        });
    }

    try {
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] },
            include: [{ model: Product, attributes: ['id', 'name', 'category', 'price', 'quantity', 'image'] }]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "Usuário não encontrado.",
                userId: userId
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                propertyName: user.propertyName,
                cityName: user.cityName,
                stateName: user.stateName,
                phoneNumber: user.phoneNumber,
                historia: user.historia,
                imageProfile: user.imageProfile,
                Products: user.Products,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);

        // Tratamento para IDs inválidos
        if (error.name === 'SequelizeDatabaseError' && error.message.includes('invalid input syntax')) {
            return res.status(400).json({
                success: false,
                msg: "ID do usuário inválido.",
                userId: userId
            });
        }

        res.status(500).json({
            success: false,
            msg: "Erro interno do servidor ao buscar usuário. Tente novamente mais tarde.",
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
}

export async function deleteUser(req, res) {
    const userId = req.params.id;

    if (!userId) {
        return res.status(400).json({
            success: false,
            msg: "ID do usuário é obrigatório.",
            field: 'userId'
        });
    }

    try {
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "Usuário não encontrado.",
                userId: userId
            });
        }

        if (user.id !== req.userId) {
            return res.status(403).json({
                success: false,
                msg: "Acesso não autorizado. Você só pode deletar sua própria conta.",
                error: 'UNAUTHORIZED_ACCESS'
            });
        }

        // Deleta todos os produtos do usuário antes de deletar o usuário
        await Product.destroy({ where: { userId: req.params.id } });
        await User.destroy({ where: { id: req.params.id } });

        return res.status(200).json({
            success: true,
            msg: "Usuário e produtos deletados com sucesso.",
            deletedUserId: userId
        });
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);

        // Tratamento para IDs inválidos
        if (error.name === 'SequelizeDatabaseError' && error.message.includes('invalid input syntax')) {
            return res.status(400).json({
                success: false,
                msg: "ID do usuário inválido.",
                userId: userId
            });
        }

        return res.status(500).json({
            success: false,
            msg: "Erro interno do servidor ao deletar usuário. Tente novamente mais tarde.",
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
}

export async function editUser(req, res) {
    const userId = req.params.id;

    if (!userId) {
        return res.status(400).json({
            success: false,
            msg: "ID do usuário é obrigatório.",
            field: 'userId'
        });
    }

    if (userId !== req.userId) {
        return res.status(403).json({
            success: false,
            msg: "Acesso não autorizado. Você só pode editar seu próprio perfil.",
            error: 'UNAUTHORIZED_ACCESS'
        });
    }

    try {
        const { username, email, propertyName, cityName, stateName, phoneNumber, phone, historia } = req.body;
        const newPhoneNumber = phoneNumber ?? phone;

        // Validação de username
        if (username && username.length < 3) {
            return res.status(400).json({
                success: false,
                msg: "Nome de usuário deve ter pelo menos 3 caracteres.",
                field: 'username',
                minLength: 3,
                currentLength: username.length
            });
        }

        // Validação de email
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    msg: "Formato de email inválido.",
                    field: 'email',
                    receivedValue: email
                });
            }
        }

        let updateData = {
            username,
            email,
            propertyName,
            cityName,
            stateName,
            historia,
            updatedAt: new Date()
        };

        if (newPhoneNumber !== undefined) {
            updateData.phoneNumber = newPhoneNumber;
        }

        if (req.file) {
            updateData.imageProfile = `/uploads/profiles/${req.file.filename}`;
        }

        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        let user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "Usuário não encontrado.",
                userId: userId
            });
        }

        await user.update(updateData);

        res.status(200).json({
            success: true,
            msg: "Perfil atualizado com sucesso!",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                propertyName: user.propertyName,
                cityName: user.cityName,
                stateName: user.stateName,
                phoneNumber: user.phoneNumber,
                historia: user.historia,
                imageProfile: user.imageProfile,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);

        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({
                success: false,
                msg: "Dados inválidos para atualização.",
                errors: error.errors.map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({
                success: false,
                msg: "Email já está em uso por outro usuário.",
                field: 'email',
                error: 'EMAIL_ALREADY_EXISTS'
            });
        }

        res.status(500).json({
            success: false,
            msg: "Erro interno do servidor ao atualizar perfil. Tente novamente mais tarde.",
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
}

export async function changePassword(req, res) {
    const userId = req.params.id;

    if (!userId) {
        return res.status(400).json({
            success: false,
            msg: "ID do usuário é obrigatório.",
            field: 'userId'
        });
    }

    if (userId !== req.userId) {
        return res.status(403).json({
            success: false,
            msg: "Acesso não autorizado. Você só pode alterar sua própria senha.",
            error: 'UNAUTHORIZED_ACCESS'
        });
    }

    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;

        // Validação de campos obrigatórios
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                msg: "Todos os campos são obrigatórios.",
                requiredFields: ['oldPassword', 'newPassword', 'confirmPassword']
            });
        }

        // Validação de nova senha
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                msg: "Nova senha deve ter pelo menos 6 caracteres.",
                field: 'newPassword',
                minLength: 6,
                currentLength: newPassword.length
            });
        }

        // Validação de confirmação de senha
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                msg: "As novas senhas não conferem.",
                field: 'confirmPassword'
            });
        }

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "Usuário não encontrado.",
                userId: userId
            });
        }

        const match = await bcrypt.compare(oldPassword, user.password);

        if (!match) {
            return res.status(401).json({
                success: false,
                msg: "Senha antiga incorreta.",
                field: 'oldPassword',
                error: 'INVALID_OLD_PASSWORD'
            });
        }

        const hashed = await bcrypt.hash(newPassword, await bcrypt.genSalt(12));
        await user.update({ password: hashed, updatedAt: new Date() });

        res.status(200).json({
            success: true,
            msg: "Senha atualizada com sucesso!",
            updatedAt: user.updatedAt
        });
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({
            success: false,
            msg: "Erro interno do servidor ao atualizar senha. Tente novamente mais tarde.",
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
}

export async function getUserByEmail(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                msg: "Email é obrigatório.",
                field: 'email'
            });
        }

        // Validação de formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                msg: "Formato de email inválido.",
                field: 'email',
                receivedValue: email
            });
        }

        const user = await User.findOne({
            where: { email },
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "Usuário não encontrado.",
                field: 'email',
                error: 'USER_NOT_FOUND'
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error('Erro ao buscar usuário por email:', error);
        res.status(500).json({
            success: false,
            msg: "Erro interno do servidor ao buscar usuário por email. Tente novamente mais tarde.",
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
}

export async function resetPassword(req, res) {
    try {
        const userId = req.params.id;
        const { newPassword, confirmPassword } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                msg: "ID do usuário é obrigatório.",
                field: 'userId'
            });
        }

        if (!newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                msg: "Senhas são obrigatórias.",
                requiredFields: ['newPassword', 'confirmPassword']
            });
        }

        // Validação de nova senha
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                msg: "Nova senha deve ter pelo menos 6 caracteres.",
                field: 'newPassword',
                minLength: 6,
                currentLength: newPassword.length
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                msg: "As senhas não conferem.",
                field: 'confirmPassword'
            });
        }

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "Usuário não encontrado.",
                userId: userId
            });
        }

        const hashed = await bcrypt.hash(newPassword, await bcrypt.genSalt(12));
        await user.update({ password: hashed, updatedAt: new Date() });

        res.status(200).json({
            success: true,
            msg: "Senha redefinida com sucesso!",
            updatedAt: user.updatedAt
        });
    } catch (error) {
        console.error('Erro ao redefinir senha:', error);

        // Tratamento para IDs inválidos
        if (error.name === 'SequelizeDatabaseError' && error.message.includes('invalid input syntax')) {
            return res.status(400).json({
                success: false,
                msg: "ID do usuário inválido.",
                userId: req.params.id
            });
        }

        res.status(500).json({
            success: false,
            msg: "Erro interno do servidor ao redefinir senha. Tente novamente mais tarde.",
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
}

export async function getAgricultores(req, res) {
    try {
        const agricultores = await User.findAll({
            where: { role: "agricultor" },
            attributes: { exclude: ['password'] }
        });

        if (agricultores.length === 0) {
            return res.status(404).json({
                success: false,
                msg: "Nenhum agricultor encontrado.",
                count: 0
            });
        }

        const agricultoresWithProducts = await Promise.all(
            agricultores.map(async (user) => {
                const products = await Product.findAll({
                    where: { userId: user.id },
                    attributes: ['id', 'name', 'category', 'price', 'quantity', 'image']
                });
                return {
                    ...user.get({ plain: true }),
                    products,
                    productCount: products.length
                };
            })
        );

        res.status(200).json({
            success: true,
            agricultores: agricultoresWithProducts,
            count: agricultoresWithProducts.length
        });
    } catch (error) {
        console.error('Erro ao buscar agricultores:', error);
        res.status(500).json({
            success: false,
            msg: "Erro interno do servidor ao buscar agricultores. Tente novamente mais tarde.",
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
}