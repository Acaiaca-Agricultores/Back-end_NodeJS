import Product from "../models/Product.js";
import User from "../models/User.js";
import { validate as isUuid } from 'uuid';

function getProductImageUrl(image) {
    if (!image) return null;
    if (image.startsWith('/uploads/products/')) {
        return image;
    }
    if (image.startsWith('/uploads/')) {
        return image.replace('/uploads/', '/uploads/products/');
    }
    return `/uploads/products/${image}`;
}

export async function registerProduct(req, res) {
    try {
        const { name, description, category: rawCategory } = req.body;
        const quantity = Number(req.body.quantity);
        const price = Number(req.body.price);

        const categoryMap = {
            agricultores: 'Agricultores',
            frutas: 'Frutas',
            verduras: 'Verduras',
            legumes: 'Legumes',
            tuberculos: 'Tubérculos',
            graos: 'Grãos',
            oleaginosas: 'Oleaginosas',
            temperos: 'Temperos',
            chas: 'Chás',
            mel: 'Mel',
            ovos: 'Ovos',
            laticinios: 'Laticínios'
        };

        const categoryKey = typeof rawCategory === 'string' ? rawCategory.trim().toLowerCase() : '';
        const category = categoryMap[categoryKey];
        const bodyImage = req.body.image;

        // Validações de campos obrigatórios
        if (!name || !description || !quantity || !category || price == null) {
            return res.status(400).json({
                success: false,
                msg: "Todos os campos são obrigatórios, incluindo categoria e preço.",
                requiredFields: ['name', 'description', 'quantity', 'category', 'price']
            });
        }

        // Validação de quantidade
        if (isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({
                success: false,
                msg: "Quantidade deve ser numérica e maior que zero.",
                field: 'quantity',
                receivedValue: req.body.quantity
            });
        }

        // Validação de comprimento dos campos
        if (name.length < 3 || description.length < 10) {
            return res.status(400).json({
                success: false,
                msg: "Nome do produto deve ter pelo menos 3 caracteres e descrição pelo menos 10.",
                validation: {
                    name: { minLength: 3, currentLength: name.length },
                    description: { minLength: 10, currentLength: description.length }
                }
            });
        }

        // Validação de categoria
        if (!category) {
            return res.status(400).json({
                success: false,
                msg: "Categoria inválida. Categorias válidas: Agricultores, Frutas, Verduras, Legumes, Tubérculos, Grãos, Oleaginosas, Temperos, Chás, Mel, Ovos, Laticínios.",
                validCategories: Object.values(categoryMap),
                receivedCategory: rawCategory
            });
        }

        // Validação de preço
        if (isNaN(price) || price <= 0) {
            return res.status(400).json({
                success: false,
                msg: "Preço deve ser numérico e maior que zero.",
                field: 'price',
                receivedValue: req.body.price
            });
        }

        // Validação de UUID do usuário
        if (!isUuid(req.userId)) {
            return res.status(401).json({
                success: false,
                msg: "ID de usuário inválido. Faça login novamente.",
                error: 'INVALID_USER_ID'
            });
        }

        // Validação de imagem
        const imagePath = req.file ? `/uploads/products/${req.file.filename}` : bodyImage;
        if (!imagePath) {
            return res.status(400).json({
                success: false,
                msg: "Foto do produto é obrigatória.",
                field: 'image'
            });
        }

        const product = await Product.create({
            name,
            description,
            category,
            quantity,
            price,
            image: imagePath,
            userId: req.userId
        });

        res.status(201).json({
            success: true,
            msg: "Produto registrado com sucesso!",
            product: {
                id: product.id,
                name: product.name,
                category: product.category,
                price: product.price,
                quantity: product.quantity,
                image: getProductImageUrl(product.image),
                createdAt: product.createdAt
            }
        });
    } catch (error) {
        console.error('Erro ao registrar produto:', error);

        // Tratamento específico para erros de validação do Sequelize
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                msg: "Dados inválidos fornecidos.",
                errors: error.errors.map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        // Tratamento para erros de chave estrangeira
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({
                success: false,
                msg: "Usuário não encontrado. Verifique se está logado corretamente.",
                error: 'USER_NOT_FOUND'
            });
        }

        res.status(500).json({
            success: false,
            msg: "Erro interno do servidor ao registrar produto. Tente novamente mais tarde.",
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
}

export async function getProductsByUser(req, res) {
    const productId = req.params.id;

    if (!productId) {
        return res.status(400).json({
            success: false,
            msg: "ID do produto é obrigatório.",
            field: 'productId'
        });
    }

    try {
        const product = await Product.findByPk(productId, {
            include: { model: User, attributes: ["username", "email", "role", "propertyName", "cityName", "stateName", "phoneNumber", "imageProfile", "historia"] }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                msg: "Produto não encontrado.",
                productId: productId
            });
        }

        const productData = product.toJSON();
        productData.image = getProductImageUrl(productData.image);

        res.status(200).json({
            success: true,
            product: productData
        });
    } catch (error) {
        console.error('Erro ao buscar produto:', error);

        // Tratamento para IDs inválidos
        if (error.name === 'SequelizeDatabaseError' && error.message.includes('invalid input syntax')) {
            return res.status(400).json({
                success: false,
                msg: "ID do produto inválido.",
                productId: productId
            });
        }

        res.status(500).json({
            success: false,
            msg: "Erro interno do servidor ao buscar produto. Tente novamente mais tarde.",
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
}

export async function getAllProducts(req, res) {
    try {
        const products = await Product.findAll({
            include: { model: User, attributes: ["username", "email", "role", "propertyName", "cityName", "stateName", "phoneNumber", "imageProfile", "historia"] }
        });

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                msg: "Nenhum produto encontrado.",
                count: 0
            });
        }

        const productsWithImage = products.map(p => {
            const prod = p.toJSON();
            prod.image = getProductImageUrl(prod.image);
            return prod;
        });

        res.status(200).json({
            success: true,
            products: productsWithImage,
            count: productsWithImage.length
        });
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({
            success: false,
            msg: "Erro interno do servidor ao buscar produtos. Tente novamente mais tarde.",
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
}

export async function editProduct(req, res) {
    const productId = req.params.id;

    if (!productId) {
        return res.status(400).json({
            success: false,
            msg: "ID do produto é obrigatório.",
            field: 'productId'
        });
    }

    try {
        const { name, description, quantity, category: rawCategory, price } = req.body;

        const categoryMap = {
            agricultores: 'Agricultores',
            frutas: 'Frutas',
            verduras: 'Verduras',
            legumes: 'Legumes',
            tuberculos: 'Tubérculos',
            graos: 'Grãos',
            oleaginosas: 'Oleaginosas',
            temperos: 'Temperos',
            chas: 'Chás',
            mel: 'Mel',
            ovos: 'Ovos',
            laticinios: 'Laticínios'
        };

        const categoryKey = typeof rawCategory === 'string' ? rawCategory.trim().toLowerCase() : '';
        const category = categoryMap[categoryKey];
        const bodyImage = req.body.image;

        // Validações de campos obrigatórios
        if (!name || !description || !quantity || !category || price == null) {
            return res.status(400).json({
                success: false,
                msg: "Todos os campos são obrigatórios, incluindo categoria e preço.",
                requiredFields: ['name', 'description', 'quantity', 'category', 'price']
            });
        }

        // Validação de quantidade
        if (quantity <= 0) {
            return res.status(400).json({
                success: false,
                msg: "Quantidade deve ser maior que zero.",
                field: 'quantity',
                receivedValue: quantity
            });
        }

        if (typeof quantity !== "number") {
            return res.status(400).json({
                success: false,
                msg: "Quantidade deve ser numérica.",
                field: 'quantity',
                receivedValue: quantity,
                receivedType: typeof quantity
            });
        }

        // Validação de comprimento dos campos
        if (name.length < 3 || description.length < 10) {
            return res.status(400).json({
                success: false,
                msg: "Nome do produto deve ter pelo menos 3 caracteres e descrição pelo menos 10.",
                validation: {
                    name: { minLength: 3, currentLength: name.length },
                    description: { minLength: 10, currentLength: description.length }
                }
            });
        }

        // Validação de categoria
        if (!category) {
            return res.status(400).json({
                success: false,
                msg: "Categoria inválida. Categorias válidas: Agricultores, Frutas, Verduras, Legumes, Tubérculos, Grãos, Oleaginosas, Temperos, Chás, Mel, Ovos, Laticínios.",
                validCategories: Object.values(categoryMap),
                receivedCategory: rawCategory
            });
        }

        // Validação de preço
        if (typeof price !== "number") {
            return res.status(400).json({
                success: false,
                msg: "Preço deve ser numérico.",
                field: 'price',
                receivedValue: price,
                receivedType: typeof price
            });
        }

        if (price <= 0) {
            return res.status(400).json({
                success: false,
                msg: "Preço deve ser maior que zero.",
                field: 'price',
                receivedValue: price
            });
        }

        // Validação de imagem
        const imagePath = req.file ? `/uploads/products/${req.file.filename}` : bodyImage;
        if (!imagePath) {
            return res.status(400).json({
                success: false,
                msg: "Foto do produto é obrigatória.",
                field: 'image'
            });
        }

        const product = await Product.findByPk(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                msg: "Produto não encontrado.",
                productId: productId
            });
        }

        product.name = name;
        product.description = description;
        product.category = category;
        product.quantity = quantity;
        product.price = price;
        product.image = imagePath;
        product.updatedAt = new Date();

        await product.save();

        res.status(200).json({
            success: true,
            msg: "Produto atualizado com sucesso!",
            product: {
                id: product.id,
                name: product.name,
                category: product.category,
                price: product.price,
                quantity: product.quantity,
                image: getProductImageUrl(product.image),
                updatedAt: product.updatedAt
            }
        });
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);

        // Tratamento específico para erros de validação do Sequelize
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                msg: "Dados inválidos fornecidos para atualização.",
                errors: error.errors.map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        // Tratamento para IDs inválidos
        if (error.name === 'SequelizeDatabaseError' && error.message.includes('invalid input syntax')) {
            return res.status(400).json({
                success: false,
                msg: "ID do produto inválido.",
                productId: productId
            });
        }

        res.status(500).json({
            success: false,
            msg: "Erro interno do servidor ao atualizar produto. Tente novamente mais tarde.",
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
}

export async function deleteProduct(req, res) {
    const productId = req.params.id;

    if (!productId) {
        return res.status(400).json({
            success: false,
            msg: "ID do produto é obrigatório.",
            field: 'productId'
        });
    }

    try {
        const product = await Product.findByPk(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                msg: "Produto não encontrado.",
                productId: productId
            });
        }

        await product.destroy();

        res.status(200).json({
            success: true,
            msg: "Produto excluído com sucesso!",
            deletedProductId: productId
        });
    } catch (error) {
        console.error('Erro ao excluir produto:', error);

        // Tratamento para IDs inválidos
        if (error.name === 'SequelizeDatabaseError' && error.message.includes('invalid input syntax')) {
            return res.status(400).json({
                success: false,
                msg: "ID do produto inválido.",
                productId: productId
            });
        }

        // Tratamento para erros de chave estrangeira (produto em uso)
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(409).json({
                success: false,
                msg: "Não é possível excluir o produto pois está sendo utilizado em outras operações.",
                error: 'PRODUCT_IN_USE'
            });
        }

        res.status(500).json({
            success: false,
            msg: "Erro interno do servidor ao excluir produto. Tente novamente mais tarde.",
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
}

export async function getAllProductsByUserId(req, res) {
    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({
            success: false,
            msg: "ID do usuário é obrigatório.",
            field: 'userId'
        });
    }

    // Validação de UUID
    if (!isUuid(userId)) {
        return res.status(400).json({
            success: false,
            msg: "ID do usuário deve ser um UUID válido.",
            field: 'userId',
            receivedValue: userId
        });
    }

    try {
        const products = await Product.findAll({
            where: { userId },
        });

        if (!products || products.length === 0) {
            return res.status(404).json({
                success: false,
                msg: "Nenhum produto encontrado para este usuário.",
                userId: userId,
                count: 0
            });
        }

        const productsWithImage = products.map(p => {
            const prod = p.toJSON();
            prod.image = getProductImageUrl(prod.image);
            return prod;
        });

        res.status(200).json({
            success: true,
            products: productsWithImage,
            userId: userId,
            count: productsWithImage.length
        });
    } catch (error) {
        console.error('Erro ao buscar produtos do usuário:', error);

        // Tratamento para UUIDs inválidos
        if (error.name === 'SequelizeDatabaseError' && error.message.includes('invalid input syntax')) {
            return res.status(400).json({
                success: false,
                msg: "ID do usuário inválido.",
                userId: userId
            });
        }

        res.status(500).json({
            success: false,
            msg: "Erro interno do servidor ao buscar produtos do usuário. Tente novamente mais tarde.",
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
}

export async function getProductById(req, res) {
    const productId = req.params.id;

    if (!productId) {
        return res.status(400).json({
            success: false,
            msg: "ID do produto é obrigatório.",
            field: 'productId'
        });
    }

    try {
        const product = await Product.findByPk(productId, {
            include: { model: User, attributes: ["username", "email", "role", "propertyName", "cityName", "stateName", "phoneNumber", "imageProfile", "historia"] }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                msg: "Produto não encontrado.",
                productId: productId
            });
        }

        const productData = product.toJSON();
        productData.image = getProductImageUrl(productData.image);

        res.status(200).json({
            success: true,
            product: productData
        });
    } catch (error) {
        console.error('Erro ao buscar produto por ID:', error);

        // Tratamento para IDs inválidos
        if (error.name === 'SequelizeDatabaseError' && error.message.includes('invalid input syntax')) {
            return res.status(400).json({
                success: false,
                msg: "ID do produto inválido.",
                productId: productId
            });
        }

        res.status(500).json({
            success: false,
            msg: "Erro interno do servidor ao buscar produto. Tente novamente mais tarde.",
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
}