import express from "express";
import { register, login, getUser, deleteUser, editUser, changePassword, getUserByEmail, resetPassword, getAgricultores } from "../controllers/userController.js";
import { registerProduct, getProductsByUser, getAllProducts, editProduct, deleteProduct, getAllProductsByUserId, getProductById } from "../controllers/productController.js";
import { checkToken } from "../middleware/authMiddleware.js";
import { uploadProduct, uploadProfile } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get('/', (_req, res) => { return res.status(200).json({ msg: 'API de gerenciamento de usuários: registro, login, perfil, edição, exclusão e alteração de senha.' }) });
router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/user/agricultores", checkToken, getAgricultores);
router.get("/user/:id", checkToken, getUser);
router.delete("/user/:id", checkToken, deleteUser);
router.put("/user/:id/edit", checkToken, uploadProfile.single("profileImage"), editUser);
router.put('/user/:id/password', checkToken, changePassword);
router.post('/user', getUserByEmail);
router.put("/user/:id/reset-password", resetPassword);

router.get("/products", checkToken, getAllProducts);
router.get("/product/:id", checkToken, getProductsByUser)
router.put("/product/register", checkToken, uploadProduct.single("productImage"), registerProduct);
router.put("/product/edit/:id", checkToken, uploadProduct.single("productImage"), editProduct);
router.delete("/product/delete/:id", checkToken, deleteProduct);
router.get("/products/user/:userId", checkToken, getAllProductsByUserId);
router.get("/product/:id", checkToken, getProductById);

export default router;