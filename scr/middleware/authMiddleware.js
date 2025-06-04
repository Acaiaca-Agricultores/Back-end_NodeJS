import jwt from "jsonwebtoken";

export function checkToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ msg: "Acesso não autorizado. Por favor, faça login." });

    try {
        const secret = process.env.SECRET;
        const decoded = jwt.verify(token, secret);
        req.userId = decoded.id;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ msg: "Sua sessão expirou. Por favor, faça login novamente." });
        }
        return res.status(401).json({ msg: "Token inválido. Por favor, faça login novamente." });
    }
}
