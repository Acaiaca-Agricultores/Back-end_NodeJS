import multer from "multer";
import path from "path";
import fs from "fs";

if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}
if (!fs.existsSync("uploads/products")) {
    fs.mkdirSync("uploads/products");
}
if (!fs.existsSync("uploads/profiles")) {
    fs.mkdirSync("uploads/profiles");
}

const productStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/products/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/profiles/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

export const uploadProduct = multer({ storage: productStorage });
export const uploadProfile = multer({ storage: profileStorage });
