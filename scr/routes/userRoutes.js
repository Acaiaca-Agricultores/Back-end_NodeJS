import express from "express";
import { register, login, getUser, deleteUser, editUser } from "../controllers/userController.js";
import { checkToken } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/user/:id", checkToken, getUser);
router.delete("/user/:id", checkToken, deleteUser);
router.put("/user/:id/edit", checkToken, upload.single("profileImage"), editUser);

export default router;
