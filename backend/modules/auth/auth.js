import jwt from "jsonwebtoken";

export function Auth(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(403).json({
            success: false,
            message: "No token provided"
        });
    }

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode;
        
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized or expired token"
        });
    }
}