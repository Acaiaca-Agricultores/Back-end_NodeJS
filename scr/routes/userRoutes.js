import express from "express";
import { register, login, getUser, deleteUser, editUser, changePassword, getUserByEmail, resetPassword } from "../controllers/userController.js";
import { checkToken } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get('/', (_req, res) => { return res.status(200).json({ msg: 'API de gerenciamento de usuários: registro, login, perfil, edição, exclusão e alteração de senha.' }) });
router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/user/:id", checkToken, getUser);
router.delete("/user/:id", checkToken, deleteUser);
router.put("/user/:id/edit", checkToken, upload.single("profileImage"), editUser);
router.put('/user/:id/password', checkToken, changePassword);
router.post('/user', getUserByEmail);
router.put("/user/:id/reset-password", resetPassword);

export default router;
