import express from "express";
import { register, login, getUser, deleteUser, editUser, changePassword } from "../controllers/userController.js";
import { checkToken } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/user/:id", checkToken, getUser);
router.delete("/user/:id", checkToken, deleteUser);
router.put("/user/:id/edit", checkToken, upload.single("profileImage"), editUser);
router.put('/user/:id/password', checkToken, changePassword);

export default router;
