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
        const categoryMap = { fruta: 'Fruta', verdura: 'Verdura', legume: 'Legume' };
        const categoryKey = typeof rawCategory === 'string' ? rawCategory.trim().toLowerCase() : '';
        const category = categoryMap[categoryKey];
        const bodyImage = req.body.image;
        if (!name || !description || !quantity || !category || price == null) {
            return res.status(422).json({ msg: "Todos os campos são obrigatórios, incluindo categoria e preço." });
        } else if (isNaN(quantity) || quantity <= 0) {
            return res.status(422).json({ msg: "Quantidade deve ser numérica e maior que zero." });
        } else if (name.length < 3 || description.length < 10) {
            return res.status(422).json({ msg: "Nome do produto deve ter pelo menos 3 caracteres e descrição pelo menos 10." });
        } else if (!category) {
            return res.status(422).json({ msg: "Categoria inválida. Deve ser 'Fruta', 'Verdura' ou 'Legume'." });
        } else if (isNaN(price) || price <= 0) {
            return res.status(422).json({ msg: "Preço deve ser numérico e maior que zero." });
        } else if (!isUuid(req.userId)) {
            return res.status(400).json({ msg: "ID de usuário inválido. Faça login novamente." });
        }
        const imagePath = req.file ? `/uploads/products/${req.file.filename}` : bodyImage;
        if (!imagePath) {
            return res.status(422).json({ msg: "Foto do produto é obrigatória." });
        }
        const product = await Product.create({
            name,
            description,
            category,
            quantity, // já convertido para número
            price,    // já convertido para número
            image: imagePath,
            userId: req.userId
        });
        res.status(201).json({ msg: "Produto registrado com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao registrar produto. Tente novamente mais tarde." });
    }
}

export async function getProductsByUser(req, res) {
    const productId = req.params.id;
    if (!productId) {
        return res.status(422).json({ msg: "ID do produto é obrigatório." });
    }
    try {
        const product = await Product.findByPk(productId, {
            include: { model: User, attributes: ["username", "email", "role", "propertyName", "cityName", "stateName", "phoneNumber", "imageProfile"] }
        });
        if (!product) {
            return res.status(404).json({ msg: "Produto não encontrado." });
        }
        const productData = product.toJSON();
        productData.image = getProductImageUrl(productData.image);
        res.status(200).json(productData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao buscar produto. Tente novamente mais tarde." });
    }
}

export async function getAllProducts(req, res) {
    try {
        const products = await Product.findAll({
            include: { model: User, attributes: ["username", "email", "role", "propertyName", "cityName", "stateName", "phoneNumber", "imageProfile"] }
        });
        if (products.length === 0) {
            return res.status(404).json({ msg: "Nenhum produto encontrado." });
        }
        const productsWithImage = products.map(p => {
            const prod = p.toJSON();
            prod.image = getProductImageUrl(prod.image);
            return prod;
        });
        res.status(200).json(productsWithImage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao buscar produtos. Tente novamente mais tarde." });
    }
}

export async function editProduct(req, res) {
    const productId = req.params.id;
    if (!productId) {
        return res.status(422).json({ msg: "ID do produto é obrigatório." });
    }
    try {
        const { name, description, quantity, category: rawCategory, price } = req.body;
        // Replace category normalization with mapping to enum values
        const categoryMap = { fruta: 'Fruta', verdura: 'Verdura', legume: 'Legume' };
        const categoryKey = typeof rawCategory === 'string' ? rawCategory.trim().toLowerCase() : '';
        const category = categoryMap[categoryKey];
        const bodyImage = req.body.image;
        if (!name || !description || !quantity || !category || price == null) {
            return res.status(422).json({ msg: "Todos os campos são obrigatórios, incluindo categoria e preço." });
        } else if (quantity <= 0) {
            return res.status(422).json({ msg: "Quantidade deve ser maior que zero." });
        } else if (typeof quantity !== "number") {
            return res.status(422).json({ msg: "Quantidade deve ser numérica." });
        } else if (name.length < 3 || description.length < 10) {
            return res.status(422).json({ msg: "Nome do produto deve ter pelo menos 3 caracteres e descrição pelo menos 10." });
        } else if (!category) {
            return res.status(422).json({ msg: "Categoria inválida. Deve ser 'Fruta', 'Verdura' ou 'Legume'." });
        } else if (typeof price !== "number") {
            return res.status(422).json({ msg: "Preço deve ser numérico." });
        } else if (price <= 0) {
            return res.status(422).json({ msg: "Preço deve ser maior que zero." });
        }
        const imagePath = req.file ? `/uploads/products/${req.file.filename}` : bodyImage;
        if (!imagePath) {
            return res.status(422).json({ msg: "Foto do produto é obrigatória." });
        }
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ msg: "Produto não encontrado." });
        }
        product.name = name;
        product.description = description;
        product.category = category;
        product.quantity = quantity;
        product.price = price;
        product.image = imagePath;
        product.updatedAt = new Date();
        await product.save();
        res.status(200).json({ msg: "Produto atualizado com sucesso!", product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao atualizar produto. Tente novamente mais tarde." });
    }
}

export async function deleteProduct(req, res) {
    const productId = req.params.id;
    if (!productId) {
        return res.status(422).json({ msg: "ID do produto é obrigatório." });
    }
    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ msg: "Produto não encontrado." });
        }
        await product.destroy();
        res.status(200).json({ msg: "Produto excluído com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao excluir produto. Tente novamente mais tarde." });
    }
}

export async function getAllProductsByUserId(req, res) {
    const userId = req.params.userId;
    if (!userId) {
        return res.status(422).json({ msg: "ID do usuário é obrigatório." });
    }
    try {
        const products = await Product.findAll({
            where: { userId },
        });
        if (!products || products.length === 0) {
            return res.status(404).json({ msg: "Nenhum produto encontrado para este usuário." });
        }
        const productsWithImage = products.map(p => {
            const prod = p.toJSON();
            prod.image = getProductImageUrl(prod.image);
            return prod;
        });
        res.status(200).json(productsWithImage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao buscar produtos do usuário. Tente novamente mais tarde." });
    }
}