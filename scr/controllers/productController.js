import Product from "../models/Product.js";

export async function registerProduct(req, res) {
    try {
        const { name, description, quantity, category: rawCategory, price } = req.body;
        const category = typeof rawCategory === 'string' ? rawCategory.trim().toLowerCase() : rawCategory;
        const bodyImage = req.body.image;
        if (!name || !description || !quantity || !category || price == null) {
            return res.status(422).json({ msg: "Todos os campos são obrigatórios, incluindo categoria e preço." });
        } else if (quantity <= 0) {
            return res.status(422).json({ msg: "Quantidade deve ser maior que zero." });
        } else if (typeof quantity !== "number") {
            return res.status(422).json({ msg: "Quantidade deve ser numérica." });
        } else if (name.length < 3 || description.length < 10) {
            return res.status(422).json({ msg: "Nome do produto deve ter pelo menos 3 caracteres e descrição pelo menos 10." });
        } else if (!["Fruta", "Verdura", "Legume"].includes(category)) {
            return res.status(422).json({ msg: "Categoria inválida. Deve ser 'Fruta', 'Verdura' ou 'Legume'." });
        } else if (typeof price !== "number") {
            return res.status(422).json({ msg: "Preço deve ser numérico." });
        } else if (price <= 0) {
            return res.status(422).json({ msg: "Preço deve ser maior que zero." });
        }
        const imagePath = req.file ? `/uploads/${req.file.filename}` : bodyImage;
        if (!imagePath) {
            return res.status(422).json({ msg: "Foto do produto é obrigatória." });
        }
        const product = new Product({
            name,
            description,
            category,
            quantity,
            price,
            image: imagePath,
            userId: req.userId,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await product.save();
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
        const product = await Product.findById(productId)
            .populate("userId", "username email role propertyName cityName stateName phoneNumber imageProfile");
        if (!product) {
            return res.status(404).json({ msg: "Produto não encontrado." });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao buscar produto. Tente novamente mais tarde." });
    }
}

export async function getAllProducts(req, res) {
    try {
        const products = await Product.find().populate("userId", "username email role propertyName cityName stateName phoneNumber imageProfile");
        if (products.length === 0) {
            return res.status(404).json({ msg: "Nenhum produto encontrado." });
        }
        res.status(200).json(products);
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
        const category = typeof rawCategory === 'string' ? rawCategory.trim().toLowerCase() : rawCategory;
        const bodyImage = req.body.image;
        if (!name || !description || !quantity || !category || price == null) {
            return res.status(422).json({ msg: "Todos os campos são obrigatórios, incluindo categoria e preço." });
        } else if (quantity <= 0) {
            return res.status(422).json({ msg: "Quantidade deve ser maior que zero." });
        } else if (typeof quantity !== "number") {
            return res.status(422).json({ msg: "Quantidade deve ser numérica." });
        } else if (name.length < 3 || description.length < 10) {
            return res.status(422).json({ msg: "Nome do produto deve ter pelo menos 3 caracteres e descrição pelo menos 10." });
        } else if (!["Fruta", "Verdura", "Legume"].includes(category)) {
            return res.status(422).json({ msg: "Categoria inválida. Deve ser 'Fruta', 'Verdura' ou 'Legume'." });
        } else if (typeof price !== "number") {
            return res.status(422).json({ msg: "Preço deve ser numérico." });
        } else if (price <= 0) {
            return res.status(422).json({ msg: "Preço deve ser maior que zero." });
        }
        const imagePath = req.file ? `/uploads/${req.file.filename}` : bodyImage;
        if (!imagePath) {
            return res.status(422).json({ msg: "Foto do produto é obrigatória." });
        }
        const product = await Product.findByIdAndUpdate(productId, {
            name,
            description,
            category,
            quantity,
            price,
            image: imagePath,
            updatedAt: new Date()
        }, { new: true });
        if (!product) {
            return res.status(404).json({ msg: "Produto não encontrado." });
        }
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
        const product = await Product.findByIdAndDelete(productId);
        if (!product) {
            return res.status(404).json({ msg: "Produto não encontrado." });
        }
        res.status(200).json({ msg: "Produto excluído com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao excluir produto. Tente novamente mais tarde." });
    }
}